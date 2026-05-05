import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useResiliNet } from '../context/ResiliNetContext';
import { useAuth } from '../context/AuthContext';
import { TacticalMessageType } from '../lib/types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { cn } from '../lib/utils';
import { Activity, Globe, Lock, Send, Shield, Users, Radio } from 'lucide-react';

const deliveryCopy: Record<TacticalMessageType, { title: string; description: string }> = {
  broadcast: {
    title: 'Broadcast',
    description: 'Delivered to all active nodes.',
  },
  unicast: {
    title: 'Unicast',
    description: 'Delivered only to the selected node.',
  },
};

type ChatBoxVariant = 'dock' | 'page';

interface ChatBoxProps {
  variant?: ChatBoxVariant;
}

export function ChatBox({ variant = 'dock' }: ChatBoxProps) {
  const { user, role } = useAuth();
  const {
    nodes,
    messages,
    chatIsLoading,
    chatIsSending,
    chatError,
    chatStatusLabel,
    sendChatMessage,
  } = useResiliNet();
  const [deliveryMode, setDeliveryMode] = useState<TacticalMessageType>('broadcast');
  const [recipientId, setRecipientId] = useState<string>('');
  const [draft, setDraft] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isDocked = variant === 'dock';
  const shellClassName = isDocked
    ? 'hidden xl:flex fixed bottom-6 right-6 z-40 w-[24rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-950/88 shadow-[0_0_40px_rgba(34,211,238,0.12)] backdrop-blur-xl'
    : 'flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-950/88 shadow-[0_0_40px_rgba(34,211,238,0.12)] backdrop-blur-xl';
  const modeStyles = deliveryMode === 'broadcast'
    ? {
        shell: 'border-rose-400/20 shadow-[0_0_40px_rgba(244,63,94,0.12)]',
        headerIcon: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
        status: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
        badge: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
      }
    : {
        shell: 'border-violet-400/20 shadow-[0_0_40px_rgba(139,92,246,0.12)]',
        headerIcon: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
        status: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
        badge: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
      };

  const localNodeId = user?.node_id ?? '';
  const recipientNodes = useMemo(
    () => nodes.filter(node => node.id !== localNodeId),
    [nodes, localNodeId]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (deliveryMode === 'unicast' && !recipientId && recipientNodes.length > 0) {
      setRecipientId(recipientNodes[0].id);
    }
  }, [deliveryMode, recipientId, recipientNodes]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = draft.trim();

    if (!content || !localNodeId) {
      return;
    }

    if (deliveryMode === 'unicast' && !recipientId) {
      return;
    }

    await sendChatMessage(content, deliveryMode === 'broadcast' ? null : recipientId);

    setDraft('');
  };

  if (isDocked && !isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hidden xl:flex fixed bottom-6 right-6 z-40 items-center gap-3 rounded-full border border-cyan-400/30 bg-slate-950/85 px-4 py-3 text-xs font-semibold tracking-[0.24em] uppercase text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.18)] backdrop-blur-md"
      >
        <Radio className="h-4 w-4 text-cyan-300" />
        Tactical Comms
      </button>
    );
  }

  return (
    <section className={`${shellClassName} ${modeStyles.shell}`}>
      <header className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${modeStyles.headerIcon}`}>
              {deliveryMode === 'broadcast' ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white">Tactical Communications</h2>
              <p className="text-[11px] text-muted-foreground">{deliveryCopy[deliveryMode].description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-1', modeStyles.status)}>
              <Activity className="h-3 w-3" />
              {chatStatusLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/70">{role?.toUpperCase() || 'UNKNOWN'}</span>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-white/5 hover:text-white"
        >
          <span className="text-lg leading-none">−</span>
        </Button>
      </header>

      <div className="border-b border-white/10 px-4 py-3">
        <Tabs value={deliveryMode} onValueChange={(value) => setDeliveryMode(value as TacticalMessageType)}>
          <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1">
            <TabsTrigger value="broadcast" className="gap-2 data-[state=active]:bg-rose-400 data-[state=active]:text-slate-950">
              <Globe className="h-3.5 w-3.5" /> Broadcast
            </TabsTrigger>
            <TabsTrigger value="unicast" className="gap-2 data-[state=active]:bg-violet-400 data-[state=active]:text-slate-950">
              <Lock className="h-3.5 w-3.5" /> Unicast
            </TabsTrigger>
          </TabsList>

          <TabsContent value="broadcast" className="mt-3 space-y-2">
            <p className="text-[11px] text-muted-foreground">
              Broadcast messages are written once and replicated to every connected node that passes the client-side filter.
            </p>
          </TabsContent>

          <TabsContent value="unicast" className="mt-3 space-y-3">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Target Node</Label>
              <Select value={recipientId} onValueChange={setRecipientId} disabled={recipientNodes.length === 0}>
                <SelectTrigger className="border-white/10 bg-white/5 text-sm">
                  <SelectValue placeholder={recipientNodes.length === 0 ? 'No other nodes available' : 'Select a node'} />
                </SelectTrigger>
                <SelectContent>
                  {recipientNodes.map(node => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.name} · {node.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Unicast messages are persisted once with a recipient ID and are only rendered on the matching node client.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <ScrollArea className="flex-1 min-h-0 border-b border-white/10 bg-black/20 px-3 py-3">
        <div className="space-y-3 pr-1">
          {chatIsLoading && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-center text-xs text-muted-foreground">
              Syncing tactical traffic...
            </div>
          )}

          {!chatIsLoading && messages.length === 0 && (
            <div className="rounded-xl border border-dashed border-cyan-400/20 bg-cyan-400/5 px-3 py-6 text-center text-xs text-muted-foreground">
              No visible messages yet. Broadcast a note or send a targeted unicast.
            </div>
          )}

          {messages.map(message => {
            const isOwnMessage = message.sender_id === localNodeId;
            const timestamp = new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const isBroadcast = message.type === 'broadcast';
            const cardClassName = isBroadcast
              ? 'ml-0 border-rose-400/20 bg-gradient-to-br from-rose-500/10 via-slate-950/40 to-indigo-500/10 shadow-[0_0_18px_rgba(244,63,94,0.08)]'
              : 'ml-4 border-violet-400/20 bg-gradient-to-br from-violet-500/10 via-slate-950/40 to-slate-950/40 shadow-[0_0_18px_rgba(139,92,246,0.08)]';

            return (
              <article
                key={message.id}
                className={cn(
                  'rounded-2xl border px-3 py-2.5 shadow-sm',
                  cardClassName,
                  !isOwnMessage && 'mr-6'
                )}
              >
                <div className="mb-2 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={cn('border text-[10px]', isBroadcast ? 'border-rose-400/20 bg-rose-400/10 text-rose-100' : 'border-violet-400/20 bg-violet-400/10 text-violet-100')}>
                      {message.type === 'broadcast' ? 'ALL NODES' : 'TARGETED'}
                    </Badge>
                    <span className="font-mono">{message.sender_id}</span>
                  </div>
                  <span>{timestamp}</span>
                </div>
                <p className="text-sm leading-relaxed text-white/90">{message.content}</p>
                {message.recipient_id && (
                  <p className="mt-2 text-[11px] text-violet-200/80">
                    Target: <span className="font-mono">{message.recipient_id}</span>
                  </p>
                )}
              </article>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="shrink-0 space-y-3 p-4">
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Message</Label>
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Compose a tactical update..."
            className="border-white/10 bg-white/5 text-sm placeholder:text-muted-foreground/60"
          />
        </div>

        {chatError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {chatError}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            {deliveryMode === 'broadcast'
              ? 'Broadcast will replicate to every node client that is subscribed.'
              : recipientId
                ? `Unicast will route to ${recipientId}.`
                : 'Choose a target node before sending.'}
          </p>
          <Button
            type="submit"
            disabled={chatIsSending || !draft.trim() || (deliveryMode === 'unicast' && !recipientId)}
            className="gap-2 bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          >
            <Send className="h-4 w-4" />
            {chatIsSending ? 'Sending' : 'Send'}
          </Button>
        </div>
      </form>
    </section>
  );
}