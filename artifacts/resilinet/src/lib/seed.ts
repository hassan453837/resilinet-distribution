import { Node, Incident, AppEvent } from './types';

const now = Date.now();

export const SEED_NODES: Node[] = [
  {
    id: 'HOS-A47',
    name: 'PIMS Hospital',
    type: 'hospital',
    status: 'online',
    location: { lat: 33.7295, lng: 73.0931, address: 'Sector G-8/3, Islamabad' },
    resources: {
      hospital: {
        beds: 42,
        icu: 8,
        blood: { 'O+': 120, 'O-': 28, 'A+': 45, 'A-': 18, 'B+': 60, 'B-': 14, 'AB+': 15, 'AB-': 6 },
        acceptingCases: true
      }
    },
    lastHeartbeat: now
  },
  {
    id: 'AMB-B82',
    name: 'Rescue 1122 HQ',
    type: 'ambulance',
    status: 'online',
    location: { lat: 33.7094, lng: 73.0551, address: 'Sector G-9/4, Islamabad' },
    resources: {
      ambulance: {
        unitsAvailable: 15,
        unitsOnDuty: 8,
        totalUnits: 23,
        fuelLevel: 85
      }
    },
    lastHeartbeat: now
  },
  {
    id: 'POL-C13',
    name: 'Islamabad Police HQ',
    type: 'police',
    status: 'online',
    location: { lat: 33.7215, lng: 73.0433, address: 'Sector F-8/1, Islamabad' },
    resources: {
      police: {
        unitsAvailable: 24,
        unitsOnPatrol: 56,
        totalUnits: 80,
        activeZone: 'Blue Area',
        armed: true
      }
    },
    lastHeartbeat: now
  }
];

export const SEED_INCIDENTS: Incident[] = [
  {
    id: 'INC-101',
    title: 'Multi-vehicle collision',
    description: 'Multi-vehicle collision on Kashmir Highway, 3 injured. Require immediate medical and police assistance.',
    severity: 'critical',
    type: 'traffic',
    status: 'active',
    location: { lat: 33.6938, lng: 73.0092, address: 'Kashmir Highway near G-10' },
    createdAt: now - 1000 * 60 * 15, // 15 mins ago
  },
  {
    id: 'INC-102',
    title: 'Commercial building fire',
    description: 'Fire reported on 3rd floor of commercial plaza. Evacuation in progress.',
    severity: 'critical',
    type: 'fire',
    status: 'dispatched',
    location: { lat: 33.7215, lng: 73.0600, address: 'Blue Area' },
    createdAt: now - 1000 * 60 * 45, // 45 mins ago
    assignedNodeId: 'AMB-B82'
  },
  {
    id: 'INC-103',
    title: 'Armed robbery',
    description: 'Armed robbery at jewelry store. Suspects fled in white sedan.',
    severity: 'critical',
    type: 'crime',
    status: 'active',
    location: { lat: 33.6938, lng: 73.0433, address: 'G-9 Markaz' },
    createdAt: now - 1000 * 60 * 5, // 5 mins ago
  },
  {
    id: 'INC-104',
    title: 'Cardiac arrest',
    description: 'Elderly patient experiencing severe chest pain and shortness of breath.',
    severity: 'moderate',
    type: 'medical',
    status: 'dispatched',
    location: { lat: 33.5553, lng: 73.1076, address: 'Bahria Town Phase 7' },
    createdAt: now - 1000 * 60 * 20, // 20 mins ago
    assignedNodeId: 'AMB-B82'
  },
  {
    id: 'INC-105',
    title: 'Minor traffic accident',
    description: 'Fender bender, no injuries reported. Blocking one lane.',
    severity: 'low',
    type: 'traffic',
    status: 'active',
    location: { lat: 33.7295, lng: 73.0931, address: 'F-8 Markaz' },
    createdAt: now - 1000 * 60 * 30, // 30 mins ago
  },
  {
    id: 'INC-106',
    title: 'Suspicious package',
    description: 'Unattended backpack found near bus stop.',
    severity: 'moderate',
    type: 'crime',
    status: 'dispatched',
    location: { lat: 33.5973, lng: 73.0479, address: 'Rawalpindi Saddar' },
    createdAt: now - 1000 * 60 * 60, // 1 hour ago
    assignedNodeId: 'POL-C13'
  },
  {
    id: 'INC-107',
    title: 'Food poisoning cluster',
    description: 'Multiple reports of food poisoning from a local restaurant.',
    severity: 'moderate',
    type: 'medical',
    status: 'active',
    location: { lat: 33.7215, lng: 73.0433, address: 'F-7 Markaz' },
    createdAt: now - 1000 * 60 * 120, // 2 hours ago
  },
  {
    id: 'INC-108',
    title: 'Power line down',
    description: 'Live power line fallen across residential street after storm.',
    severity: 'critical',
    type: 'fire',
    status: 'resolved',
    location: { lat: 33.6844, lng: 73.0479, address: 'Sector G-11/2' },
    createdAt: now - 1000 * 60 * 240, // 4 hours ago
    resolvedAt: now - 1000 * 60 * 30, // resolved 30 mins ago
    resolutionNote: 'Power company secured the area and repaired the line.'
  }
];

export const SEED_EVENTS: AppEvent[] = [
  { id: 'EVT-001', type: 'NODE_ONLINE', message: 'Node HOS-A47 (PIMS Hospital) registered to cluster', timestamp: now - 1000 * 60 * 300, nodeId: 'HOS-A47' },
  { id: 'EVT-002', type: 'NODE_ONLINE', message: 'Node AMB-B82 (Rescue 1122 HQ) registered to cluster', timestamp: now - 1000 * 60 * 299, nodeId: 'AMB-B82' },
  { id: 'EVT-003', type: 'NODE_ONLINE', message: 'Node POL-C13 (Islamabad Police HQ) registered to cluster', timestamp: now - 1000 * 60 * 298, nodeId: 'POL-C13' },
  { id: 'EVT-004', type: 'INCIDENT_CREATED', message: 'New critical fire incident reported in Blue Area', timestamp: now - 1000 * 60 * 45, incidentId: 'INC-102' },
  { id: 'EVT-005', type: 'UNIT_DISPATCHED', message: 'Ambulance unit dispatched to INC-102', timestamp: now - 1000 * 60 * 42, nodeId: 'AMB-B82', incidentId: 'INC-102' },
  { id: 'EVT-006', type: 'INCIDENT_CREATED', message: 'New moderate medical incident reported in Bahria Town', timestamp: now - 1000 * 60 * 20, incidentId: 'INC-104' },
  { id: 'EVT-007', type: 'UNIT_DISPATCHED', message: 'Ambulance unit dispatched to INC-104', timestamp: now - 1000 * 60 * 18, nodeId: 'AMB-B82', incidentId: 'INC-104' },
  { id: 'EVT-008', type: 'INCIDENT_CREATED', message: 'New critical traffic incident reported on Kashmir Highway', timestamp: now - 1000 * 60 * 15, incidentId: 'INC-101' },
  { id: 'EVT-009', type: 'INCIDENT_CREATED', message: 'New critical crime incident reported in G-9 Markaz', timestamp: now - 1000 * 60 * 5, incidentId: 'INC-103' },
  { id: 'EVT-010', type: 'STATUS_UPDATED', message: 'Police unit deployed to G-9 Markaz area', timestamp: now - 1000 * 60 * 2, nodeId: 'POL-C13' },
  { id: 'EVT-011', type: 'NODE_OFFLINE', message: 'Heartbeat missed for POL-C13. Marking offline.', timestamp: now - 1000 * 60 * 240, nodeId: 'POL-C13' },
  { id: 'EVT-012', type: 'FAILOVER', message: 'Rerouting police dispatches to backup node', timestamp: now - 1000 * 60 * 239 },
  { id: 'EVT-013', type: 'NODE_RECOVERED', message: 'Node POL-C13 recovered. Resuming normal operations.', timestamp: now - 1000 * 60 * 230, nodeId: 'POL-C13' },
  { id: 'EVT-014', type: 'INCIDENT_CREATED', message: 'New low traffic incident reported in F-8 Markaz', timestamp: now - 1000 * 60 * 30, incidentId: 'INC-105' },
  { id: 'EVT-015', type: 'STATUS_UPDATED', message: 'INC-108 resolved. Units returning to base.', timestamp: now - 1000 * 60 * 30, incidentId: 'INC-108' },
  { id: 'EVT-016', type: 'INCIDENT_CREATED', message: 'New moderate crime incident reported in Rawalpindi Saddar', timestamp: now - 1000 * 60 * 60, incidentId: 'INC-106' },
  { id: 'EVT-017', type: 'UNIT_DISPATCHED', message: 'Police unit dispatched to INC-106', timestamp: now - 1000 * 60 * 55, nodeId: 'POL-C13', incidentId: 'INC-106' },
  { id: 'EVT-018', type: 'INCIDENT_CREATED', message: 'New moderate medical incident reported in F-7 Markaz', timestamp: now - 1000 * 60 * 120, incidentId: 'INC-107' },
  { id: 'EVT-019', type: 'STATUS_UPDATED', message: 'PIMS Hospital ICU capacity at 80%', timestamp: now - 1000 * 60 * 10, nodeId: 'HOS-A47' },
  { id: 'EVT-020', type: 'STATUS_UPDATED', message: 'Rescue 1122 HQ shift change completed', timestamp: now - 1000 * 60 * 1, nodeId: 'AMB-B82' }
];
