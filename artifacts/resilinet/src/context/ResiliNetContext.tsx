import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Node, Incident, AppEvent, EventType, IncidentStatus } from '../lib/types';
import { SEED_INCIDENTS, SEED_EVENTS } from '../lib/seed';
import { socket } from '../lib/socket';

interface ResiliNetState {
  nodes: Node[];
  incidents: Incident[];
  events: AppEvent[];
}

interface ResiliNetContextType extends ResiliNetState {
  addIncident: (incident: Omit<Incident, 'id' | 'createdAt'>) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  resolveIncident: (id: string, note: string) => void;
  killNode: (id: string) => void;
  recoverNode: (id: string) => void;
  fireEvent: (type: EventType, message: string, nodeId?: string, incidentId?: string) => void;
  resetSimulation: () => void;
}

const ResiliNetContext = createContext<ResiliNetContextType | undefined>(undefined);

export function ResiliNetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ResiliNetState>({
    nodes: [],
    incidents: [],
    events: SEED_EVENTS
  });

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
    setState({ nodes: [], incidents: SEED_INCIDENTS, events: SEED_EVENTS });
  }, []);

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

    return () => {
      socket.off('init');
      socket.off('init-nodes');
      socket.off('add-incident');
      socket.off('resolve-incident');
      socket.off('node-offline');
      socket.off('node-online');
    };
  }, []);

  return (
    <ResiliNetContext.Provider value={{ 
      ...state, 
      addIncident, 
      updateIncident, 
      resolveIncident, 
      killNode, 
      recoverNode, 
      fireEvent,
      resetSimulation
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
