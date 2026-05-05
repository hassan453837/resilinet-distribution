import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { TacticalMessage, TacticalMessageInput } from '../lib/types';

function isVisibleToNode(message: TacticalMessage, nodeId: string) {
  return message.recipient_id === null || message.recipient_id === nodeId;
}

function sortByCreatedAt(messages: TacticalMessage[]) {
  return [...messages].sort((left, right) => {
    return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
  });
}

function upsertMessage(messages: TacticalMessage[], nextMessage: TacticalMessage) {
  const withoutDuplicate = messages.filter(message => message.id !== nextMessage.id);
  return sortByCreatedAt([...withoutDuplicate, nextMessage]);
}

export function useTacticalCommunications(nodeId?: string) {
  const [messages, setMessages] = useState<TacticalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isActive = true;
    const client = supabase;

    if (!hasSupabaseConfig || !client) {
      setError('Supabase configuration is missing. Set SUPABASE_URL and SUPABASE_ANON_KEY.');
      setIsLoading(false);
      return;
    }

    if (!nodeId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    const loadMessages = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: loadError } = await client
        .from('messages')
        .select('id, created_at, sender_id, recipient_id, content, type')
        .order('created_at', { ascending: true })
        .limit(200);

      if (loadError) {
        if (isActive) {
          setError(loadError.message);
          setMessages([]);
          setIsLoading(false);
        }
        return;
      }

      const visibleMessages = sortByCreatedAt((data ?? []).filter(message => isVisibleToNode(message as TacticalMessage, nodeId)) as TacticalMessage[]);

      if (isActive) {
        startTransition(() => setMessages(visibleMessages));
        setIsLoading(false);
      }
    };

    loadMessages();

    const channel: RealtimeChannel = client
      .channel(`messages:${nodeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        payload => {
          const message = payload.new as TacticalMessage;

          if (!isVisibleToNode(message, nodeId)) {
            return;
          }

          startTransition(() => {
            setMessages(prev => upsertMessage(prev, message));
          });
        }
      )
      .subscribe(status => {
        if (status === 'CHANNEL_ERROR') {
          setError('Realtime channel error. Check Supabase realtime permissions.');
        }
      });

    return () => {
      isActive = false;
      client.removeChannel(channel);
    };
  }, [nodeId, startTransition]);

  const sendMessage = useCallback(
    async (input: TacticalMessageInput) => {
      if (!supabase) {
        throw new Error('Supabase client is unavailable.');
      }

      setIsSending(true);
      setError(null);

      try {
        const payload: TacticalMessageInput = {
          sender_id: input.sender_id,
          recipient_id: input.type === 'broadcast' ? null : input.recipient_id,
          content: input.content.trim(),
          type: input.type,
        };

        const { data, error: insertError } = await supabase
          .from('messages')
          .insert(payload)
          .select('id, created_at, sender_id, recipient_id, content, type')
          .single();

        if (insertError) {
          throw insertError;
        }

        const message = data as TacticalMessage;

        if (nodeId && isVisibleToNode(message, nodeId)) {
          startTransition(() => {
            setMessages(prev => upsertMessage(prev, message));
          });
        }

        return message;
      } catch (sendError) {
        const message = sendError instanceof Error ? sendError.message : 'Failed to send tactical message.';
        setError(message);
        throw sendError;
      } finally {
        setIsSending(false);
      }
    },
    [nodeId, startTransition]
  );

  const statusLabel = useMemo(() => {
    if (!hasSupabaseConfig) return 'Supabase config missing';
    if (isLoading) return 'Syncing';
    if (error) return 'Degraded';
    return 'Live';
  }, [error, isLoading]);

  return {
    messages,
    isLoading,
    isSending,
    isPending,
    error,
    statusLabel,
    sendMessage,
  };
}