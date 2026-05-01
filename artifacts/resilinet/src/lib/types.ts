export type Role = 'hospital' | 'ambulance' | 'police' | null;

export type NodeStatus = 'online' | 'offline';

export type NodeType = 'hospital' | 'ambulance' | 'police';

export interface NodeLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface NodeResources {
  hospital?: {
    beds: number;
    icu: number;
    blood: {
      'O+': number;
      'A+': number;
      'B+': number;
      'AB+': number;
    };
    acceptingCases: boolean;
  };
  ambulance?: {
    unitsAvailable: number;
    unitsOnDuty: number;
    totalUnits: number;
    fuelLevel: number; // percentage
  };
  police?: {
    unitsAvailable: number;
    unitsOnPatrol: number;
    totalUnits: number;
    activeZone: string;
    armed: boolean;
  };
}

export interface Node {
  id: string;
  name: string;
  type: NodeType;
  status: NodeStatus;
  location: NodeLocation;
  resources: NodeResources;
  lastHeartbeat: number;
}

export type IncidentSeverity = 'critical' | 'moderate' | 'low' | 'resolved';
export type IncidentType = 'medical' | 'fire' | 'traffic' | 'crime';
export type IncidentStatus = 'active' | 'dispatched' | 'resolved';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  type: IncidentType;
  status: IncidentStatus;
  location: NodeLocation;
  createdAt: number;
  assignedNodeId?: string;
  resolvedAt?: number;
  resolutionNote?: string;
}

export type EventType = 
  | 'INCIDENT_CREATED' 
  | 'NODE_ONLINE' 
  | 'NODE_OFFLINE' 
  | 'UNIT_DISPATCHED' 
  | 'STATUS_UPDATED' 
  | 'FAILOVER' 
  | 'NODE_RECOVERED';

export interface AppEvent {
  id: string;
  type: EventType;
  message: string;
  timestamp: number;
  nodeId?: string;
  incidentId?: string;
}
