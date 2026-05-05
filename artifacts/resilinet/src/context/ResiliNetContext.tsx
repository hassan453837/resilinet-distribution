import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useTransition } from 'react';
import { Node, Incident, AppEvent, EventType, IncidentStatus, TacticalMessage, TacticalMessageInput } from '../lib/types';
import { SEED_INCIDENTS, SEED_EVENTS } from '../lib/seed';
import { socket } from '../lib/socket';
import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ResiliNetState {
  nodes: Node[];
  incidents: Incident[];
  events: AppEvent[];
  messages: TacticalMessage[];
}

interface ResiliNetContextType extends ResiliNetState {
  addIncident: (incident: Omit<Incident, 'id' | 'createdAt'>) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  resolveIncident: (id: string, note: string) => void;
  killNode: (id: string) => void;
  recoverNode: (id: string) => void;
  fireEvent: (type: EventType, message: string, nodeId?: string, incidentId?: string) => void;
  resetSimulation: () => void;
  sendChatMessage: (content: string, recipientId: string | null) => Promise<void>;
  chatStatusLabel: string;
  chatIsLoading: boolean;
  chatIsSending: boolean;
  chatError: string | null;
}

const ResiliNetContext = createContext<ResiliNetContextType | undefined>(undefined);

export function ResiliNetProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<ResiliNetState>({
    nodes: [],
    incidents: [],
    events: SEED_EVENTS,
    messages: []
  });
  const [chatIsLoading, setChatIsLoading] = useState(true);
  const [chatIsSending, setChatIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fireEvent = useCallback((type: EventType, message: string, nodeId?: string, incidentId?: string) => {
    const newEvent: AppEvent = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      message,
      timestamp: Date.now(),
      nodeId,
      incidentId
    };
    setState(prev => ({ ...prev, events: [newEvent, ...prev.events].slice(0, 100) }));
  }, []);

  const addIncident = useCallback((incidentData: Omit<Incident, 'id' | 'createdAt'>) => {
    const newIncident: Incident = {
      ...incidentData,
      id: `INC-${Math.floor(Math.random() * 10000)}`,
      createdAt: Date.now()
    };
    setState(prev => ({ ...prev, incidents: [newIncident, ...prev.incidents] }));
    socket.emit('add-incident', newIncident);
    fireEvent('INCIDENT_CREATED', `New ${newIncident.severity} ${newIncident.type} incident reported`, undefined, newIncident.id);
  }, [fireEvent]);

  const updateIncident = useCallback((id: string, updates: Partial<Incident>) => {
    setState(prev => ({
      ...prev,
      incidents: prev.incidents.map(inc => inc.id === id ? { ...inc, ...updates } : inc)
    }));
    fireEvent('STATUS_UPDATED', `Incident ${id} updated`, undefined, id);
  }, [fireEvent]);

  const resolveIncident = useCallback((id: string, note: string) => {
    setState(prev => ({
      ...prev,
      incidents: prev.incidents.map(inc => 
        inc.id === id 
          ? { ...inc, status: 'resolved' as IncidentStatus, resolvedAt: Date.now(), resolutionNote: note } 
          : inc
      )
    }));
    socket.emit('resolve-incident', id);
    fireEvent('STATUS_UPDATED', `Incident ${id} resolved`, undefined, id);
  }, [fireEvent]);

  const killNode = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === id ? { ...n, status: 'offline' } : n)
    }));
    fireEvent('NODE_OFFLINE', `Node ${id} has gone offline unexpectedly`, id);
    fireEvent('FAILOVER', `Rerouting traffic from ${id} to healthy nodes`);
  }, [fireEvent]);

  const recoverNode = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === id ? { ...n, status: 'online', lastHeartbeat: Date.now() } : n)
    }));
    fireEvent('NODE_RECOVERED', `Node ${id} has recovered and rejoined the cluster`, id);
  }, [fireEvent]);

  const resetSimulation = useCallback(() => {
    setState({ nodes: [], incidents: SEED_INCIDENTS, events: SEED_EVENTS, messages: [] });
  }, []);

  const localNodeId = user?.node_id;

  const isVisibleToNode = useCallback((message: TacticalMessage, nodeId: string) => {
    return !message.recipient_id || message.recipient_id === nodeId || message.sender_id === nodeId;
  }, []);

  const sortMessages = useCallback((messages: TacticalMessage[]) => {
    return [...messages].sort((left, right) => {
      return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
    });
  }, []);

  const upsertMessage = useCallback((messages: TacticalMessage[], nextMessage: TacticalMessage) => {
    const withoutDuplicate = messages.filter(message => message.id !== nextMessage.id);
    return sortMessages([...withoutDuplicate, nextMessage]);
  }, [sortMessages]);

  const sendChatMessage = useCallback(async (content: string, recipientId: string | null) => {
    if (!localNodeId) return;

    setChatIsSending(true);
    setChatError(null);

    try {
      const payload: TacticalMessageInput = {
        sender_id: localNodeId,
        recipient_id: recipientId,
        content,
        type: recipientId ? 'unicast' : 'broadcast',
      };

      await new Promise<void>((resolve, reject) => {
        socket.emit('tactical-message', payload, (response: { ok?: boolean; error?: string }) => {
          if (response?.ok) {
            resolve();
            return;
          }

          const errorMessage = response?.error || 'Failed to send chat message.';
          reject(new Error(errorMessage));
        });
      });
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : (sendError as { message?: string })?.message || 'Failed to send chat message.';
      setChatError(message);
    } finally {
      setChatIsSending(false);
    }
  }, [isVisibleToNode, localNodeId, startTransition, upsertMessage]);

  // Socket.IO real-time sync
  useEffect(() => {
    socket.on('init', (data: Incident[]) => {
      setState(prev => ({ ...prev, incidents: data }));
    });

    socket.on('init-nodes', (data: Node[]) => {
      setState(prev => ({ ...prev, nodes: data }));
    });

    socket.on('add-incident', (incident: Incident) => {
      setState(prev => ({
        ...prev,
        incidents: [incident, ...prev.incidents.filter(i => i.id !== incident.id)]
      }));
    });

    socket.on('resolve-incident', (id: string) => {
      setState(prev => ({
        ...prev,
        incidents: prev.incidents.map(i => i.id === id ? { ...i, status: 'resolved' } : i)
      }));
    });

    socket.on('node-offline', (node: Node) => {
      if (!node?.id) return;
      setState(prev => ({
        ...prev,
        nodes: prev.nodes.some(n => n.id === node.id)
          ? prev.nodes.map(n => n.id === node.id ? { ...n, ...node, status: 'offline' } : n)
          : [node, ...prev.nodes]
      }));
    });

    socket.on('node-online', (node: Node) => {
      if (!node?.id) return;
      setState(prev => ({
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === node.id ? { ...n, ...node, status: 'online', lastHeartbeat: Date.now() } : n
        )
      }));
    });

    socket.on('tactical-message-init', (initialMessages: TacticalMessage[]) => {
      if (!localNodeId || !initialMessages?.length) return;

      const visibleMessages = sortMessages(
        initialMessages.filter(message => isVisibleToNode(message, localNodeId))
      );

      startTransition(() => {
        setState(prev => ({
          ...prev,
          messages: sortMessages([...prev.messages, ...visibleMessages])
        }));
      });
    });

    socket.on('tactical-message', (msg: TacticalMessage) => {
      if (!localNodeId || !isVisibleToNode(msg, localNodeId)) return;

      startTransition(() => {
        setState(prev => ({
          ...prev,
          messages: upsertMessage(prev.messages, msg)
        }));
      });
    });

    const loadAndSubscribeMessages = async () => {
      const client = supabase;

      if (!hasSupabaseConfig || !client || !localNodeId) {
        setChatIsLoading(false);
        return;
      }

      setChatIsLoading(true);
      setChatError(null);

      const { data, error } = await client
        .from('messages')
        .select('id, created_at, sender_id, recipient_id, content, type')
        .order('created_at', { ascending: true })
        .limit(200);

      if (error) {
        setChatError(error.message);
        setChatIsLoading(false);
        return;
      }

      const visibleMessages = sortMessages(
        (data ?? []).filter(message => isVisibleToNode(message as TacticalMessage, localNodeId)) as TacticalMessage[]
      );

      startTransition(() => {
        setState(prev => ({ ...prev, messages: visibleMessages }));
      });

      const channel = client
        .channel('tactical_comms')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            const msg = payload.new as TacticalMessage;
            if (!isVisibleToNode(msg, localNodeId)) return;

            startTransition(() => {
              setState(prev => ({
                ...prev,
                messages: upsertMessage(prev.messages, msg)
              }));
            });
          }
        )
        .subscribe();

      const unsubscribe = () => {
        client.removeChannel(channel);
      };

      setChatIsLoading(false);

      return unsubscribe;
    };

    let cleanupMessages: (() => void) | undefined;
    loadAndSubscribeMessages().then(cleanup => {
      cleanupMessages = cleanup;
    });

    return () => {
      cleanupMessages?.();
      socket.off('init');
      socket.off('init-nodes');
      socket.off('add-incident');
      socket.off('resolve-incident');
      socket.off('node-offline');
      socket.off('node-online');
      socket.off('tactical-message-init');
      socket.off('tactical-message');
    };
  }, [isVisibleToNode, localNodeId, sortMessages, startTransition, upsertMessage]);

  const chatStatusLabel = useMemo(() => {
    if (!hasSupabaseConfig) return 'Supabase config missing';
    if (chatIsLoading) return 'Syncing';
    if (chatError) return 'Degraded';
    return 'Live';
  }, [chatError, chatIsLoading]);

  return (
    <ResiliNetContext.Provider value={{ 
      ...state, 
      addIncident, 
      updateIncident, 
      resolveIncident, 
      killNode, 
      recoverNode, 
      fireEvent,
      resetSimulation,
      sendChatMessage,
      chatStatusLabel,
      chatIsLoading,
      chatIsSending,
      chatError: chatError ?? (isPending ? 'Updating' : null)
    }}>
      {children}
    </ResiliNetContext.Provider>
  );
}

export function useResiliNet() {
  const context = useContext(ResiliNetContext);
  if (context === undefined) {
    throw new Error('useResiliNet must be used within a ResiliNetProvider');
  }
  return context;
}
