import React from 'react';
import { useResiliNet } from '../context/ResiliNetContext';
import IslamabadMap from '../components/IslamabadMap';
import { Shield, ShieldAlert, ShieldCheck, MapPin, Crosshair } from 'lucide-react';
import { Node } from '../lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { useAuth } from '../context/AuthContext';

function StatCard({
  title,
  value,
  icon: Icon,
  accentColor,
  description,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ElementType;
  accentColor?: string;
  description?: string;
}) {
  return (
    <div className="glass-card accent-police p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="label-muted mb-1">{title}</div>
          <div className="text-2xl font-semibold text-white">{value}</div>
          {description && <div className="text-xs text-muted-foreground mt-1">{description}</div>}
        </div>
        <Icon className={`h-5 w-5 ${accentColor === 'violet' ? 'text-violet-300' : 'text-white/70'}`} />
      </div>
    </div>
  );
}

export default function PoliceDashboard() {
  const { nodes = [], incidents = [] } = useResiliNet();
  const { user } = useAuth();

  // Find the specific precinct node assigned to this user
  const policeNode = nodes.find(n => n.id === user?.node_id) as Node;

  // FALLBACK: Provides default values if the JSON in the DB is missing keys or hasn't loaded
  const policeResources = policeNode?.resources?.police || {
    unitsAvailable: 0,
    unitsOnPatrol: 0,
    totalUnits: 0,
    activeZone: 'Blue Area',
    armed: false
  };

  const crimeIncidents = incidents.filter(
    (i) => i.type === 'crime' && i.status !== 'resolved'
  );

  // Diagnostic Log - Keep this open in F12 to verify IDs
  console.log("POLICE_DATA_CHECK:", {
    targetId: user?.node_id,
    nodeFound: !!policeNode,
    resourcesFound: !!policeNode?.resources?.police
  });

  // Error State: Node Not Found
  if (!policeNode) {
    return (
      <div className="p-8 m-6 glass-card border-red-500/50 bg-red-500/5 text-red-400">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" /> 
          Precinct Mapping Error
        </h2>
        <p className="text-sm opacity-80">
          User is assigned to Node ID: <span className="font-mono text-white px-2 py-1 bg-white/10 rounded">{user?.node_id || 'NOT_FOUND'}</span>
        </p>
        <p className="text-xs mt-4 italic opacity-60">Check the 'nodes' table in Supabase to ensure this ID exists.</p>
      </div>
    );
  }

  
  return (
    <div className="grid grid-cols-12 gap-5 h-[calc(100vh-7rem)]">
      <div className="col-span-3 flex flex-col gap-4">
        <StatCard
          title="Units Available"
          value={policeResources.unitsAvailable}
          icon={ShieldCheck}
          accentColor="violet"
          description={`out of ${policeResources.totalUnits} total`}
        />
        <StatCard
          title="Units On Patrol"
          value={policeResources.unitsOnPatrol}
          icon={ShieldAlert}
          accentColor="violet"
        />

        <div className="glass-card accent-police p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="label-muted">Active Patrol Zone</span>
            <MapPin className="h-4 w-4 text-violet-300" style={{ filter: 'drop-shadow(0 0 6px #8b5cf680)' }} />
          </div>
          <Select defaultValue={policeResources.activeZone}>
            <SelectTrigger className="w-full bg-black/30 border-violet-500/30 hover:border-violet-400/50 focus:ring-violet-400/40">
              <SelectValue placeholder="Select Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Blue Area">Blue Area</SelectItem>
              <SelectItem value="G-9 Markaz">G-9 Markaz</SelectItem>
              <SelectItem value="F-10 Markaz">F-10 Markaz</SelectItem>
              <SelectItem value="Bahria Town">Bahria Town</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="glass-card accent-police p-4 mt-auto flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-sm font-medium flex items-center gap-2 text-violet-300">
              <Crosshair className="w-3.5 h-3.5" /> Armed Response
            </div>
            <div className="text-[11px] text-muted-foreground">Tactical units standing by</div>
          </div>
          <Switch checked={policeResources.armed} className="data-[state=checked]:bg-violet-500" />
        </div>
      </div>

      <div className="col-span-6 flex flex-col">
        <div className="glass-card accent-police flex-1 p-1.5 overflow-hidden relative">
          <div className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-md text-[10px] font-mono tracking-widest"
            style={{ background: 'rgba(5, 4, 20, 0.85)', border: '1px solid rgba(139, 92, 246, 0.4)', color: '#c4b5fd', boxShadow: '0 0 12px rgba(139, 92, 246, 0.25)' }}>
            OVERLAY · {policeResources.activeZone.toUpperCase()}
          </div>
          <IslamabadMap highlightRole="police" />
        </div>
      </div>

      <div className="col-span-3 flex flex-col">
        <div className="glass-card accent-police flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-violet-500/20 flex items-center justify-between">
            <span className="label-muted">Crime / Incident Log</span>
            <span className="severity-pill" style={{ background: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.5)', color: '#ddd6fe' }}>
              {crimeIncidents.length} Active
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {crimeIncidents.map(inc => (
              <div key={inc.id} className={`incident-row ${inc.severity}`}>
                <div className="flex items-start justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-violet-300 tracking-wider">{inc.id}</span>
                  <span className={`severity-pill ${inc.severity}`}>{inc.severity}</span>
                </div>
                <div className="text-[13px] font-medium leading-snug">{inc.title}</div>
                <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-1.5">
                  <MapPin className="h-3 w-3" /> {inc.location.address}
                </div>
              </div>
            ))}
            {crimeIncidents.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-12 flex flex-col items-center gap-3">
                <Shield className="w-8 h-8 text-violet-500/40" />
                No active crime incidents
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
