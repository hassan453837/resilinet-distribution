import React from 'react';
import { useResiliNet } from '../context/ResiliNetContext';
import IslamabadMap from '../components/IslamabadMap';
import { StatCard } from '../components/StatCard';
import { Activity, CheckCircle2, Navigation, Truck, Fuel, MapPin, Loader2 } from 'lucide-react';
import { Node } from '../lib/types';
import { useAuth } from '../context/AuthContext';

export default function AmbulanceDashboard() {
  const { nodes, incidents } = useResiliNet();
  const { user } = useAuth();

  // Find the node assigned to this user
  const ambulanceNode = nodes.find(n => n.id === user?.node_id) as Node;

  // Defensive check: Normalize resource fields across legacy/new DB shapes
  const ambulanceResources = {
    unitsAvailable: ambulanceNode?.resources?.ambulance?.unitsAvailable ?? 0,
    unitsOnDuty: ambulanceNode?.resources?.ambulance?.unitsOnDuty ?? 0,
    totalUnits: ambulanceNode?.resources?.ambulance?.totalUnits ?? 0,
    fuelLevel: ambulanceNode?.resources?.ambulance?.fuelLevel ?? 0,
  };

  const assignedIncidents = incidents.filter(
    i => i.assignedNodeId === ambulanceNode?.id && i.status !== 'resolved'
  );

  // Diagnostic Log - Check your console if it's still stuck
  console.log("AMBULANCE_DATA_CHECK:", {
    targetId: user?.node_id,
    nodeFound: !!ambulanceNode,
    resourcesFound: !!ambulanceNode?.resources?.ambulance
  });

  // If the Node simply doesn't exist in the DB
  if (!ambulanceNode) {
    return (
      <div className="p-8 bg-destructive/10 border border-destructive rounded-lg text-destructive">
        <h2 className="text-lg font-bold mb-2">Station Mapping Error</h2>
        <p>Could not find ambulance station with ID: <strong>{user?.node_id || 'Not Assigned'}</strong></p>
        <p className="text-sm mt-2">Please ensure your user profile is linked to a valid node in the database.</p>
      </div>
    );
  }

  
  return (
    <div className="grid grid-cols-12 gap-5 h-[calc(100vh-7rem)]">
      <div className="col-span-3 flex flex-col gap-4">
        <StatCard
          title="Available Units"
          value={ambulanceResources.unitsAvailable}
          icon={Truck}
          accentColor="teal"
          description={`out of ${ambulanceResources.totalUnits} total`}
        />
        <StatCard
          title="Units On Duty"
          value={ambulanceResources.unitsOnDuty}
          icon={Activity}
          accentColor="teal"
        />

        <div className="glass-card accent-ambulance accent-line-top p-5" style={{ ['--line-color' as any]: 'rgba(20, 184, 166, 0.9)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="label-muted">Average Fuel Level</span>
            <Fuel className="h-4 w-4 text-teal-400" style={{ filter: 'drop-shadow(0 0 6px #14b8a680)' }} />
          </div>
          <div className="stat-number stat-gradient-teal mb-3">{ambulanceResources.fuelLevel}%</div>
          <div className="bar-track">
            <div className="bar-fill bar-fill-teal" style={{ width: `${ambulanceResources.fuelLevel}%` }} />
          </div>
        </div>

        <div className="glass-card accent-ambulance p-4 mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-teal-300 flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5" /> Live GPS
            </span>
            <span className="inline-block h-1.5 w-1.5 rounded-full live-dot-teal" />
          </div>
          <div className="font-mono text-[11px] text-muted-foreground bg-black/40 p-2.5 rounded-md border border-teal-500/15 space-y-0.5">
            <div>LAT: <span className="text-teal-300">{ambulanceNode.location.lat.toFixed(6)}</span></div>
            <div>LNG: <span className="text-teal-300">{ambulanceNode.location.lng.toFixed(6)}</span></div>
          </div>
        </div>
      </div>

      <div className="col-span-6 flex flex-col">
        <div className="glass-card accent-ambulance flex-1 p-1.5 overflow-hidden relative">
          <div className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-md text-[10px] font-mono tracking-widest"
            style={{ background: 'rgba(5, 4, 20, 0.85)', border: '1px solid rgba(20, 184, 166, 0.4)', color: '#5eead4', boxShadow: '0 0 12px rgba(20, 184, 166, 0.25)' }}>
            UNIT · AMB-B82
          </div>
          <IslamabadMap highlightRole="ambulance" />
        </div>
      </div>

      <div className="col-span-3 flex flex-col">
        <div className="glass-card accent-ambulance flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-teal-500/20 flex items-center justify-between">
            <span className="label-muted">Active Dispatches</span>
            <span className="severity-pill" style={{ background: 'rgba(20,184,166,0.15)', borderColor: 'rgba(20,184,166,0.5)', color: '#99f6e4' }}>
              {assignedIncidents.length} En Route
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {assignedIncidents.map(inc => (
              <div key={inc.id} className={`incident-row ${inc.severity}`}>
                <div className="flex items-start justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-teal-300 tracking-wider">{inc.id}</span>
                  <span className={`severity-pill ${inc.severity}`}>{inc.severity}</span>
                </div>
                <div className="text-[13px] font-medium leading-snug">{inc.title}</div>
                <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-1.5">
                  <MapPin className="h-3 w-3" /> {inc.location.address}
                </div>
              </div>
            ))}
            {assignedIncidents.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-12 flex flex-col items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-teal-500/40" />
                No active dispatches
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
