import React from 'react';
import { useResiliNet } from '../context/ResiliNetContext';
import IslamabadMap from '../components/IslamabadMap';
import { Switch } from '../components/ui/switch';
import { Activity, Bed, Droplet, MapPin } from 'lucide-react';
import { Node } from '../lib/types';
import { useAuth } from '../context/AuthContext';

const bloodBarClass: Record<string, string> = {
  'O+': 'bar-fill-red',
  'O-': 'bar-fill-red',
  'A+': 'bar-fill-blue',
  'A-': 'bar-fill-blue',
  'B+': 'bar-fill-green',
  'B-': 'bar-fill-green',
  'AB+': 'bar-fill-purple',
  'AB-': 'bar-fill-purple',
};

export default function HospitalDashboard() {
  const { nodes, incidents } = useResiliNet();
  const { user } = useAuth();
  const hospitalNode = nodes.find(n => n.id === user?.node_id) as Node;
  const hospitalResources = hospitalNode?.resources.hospital;

  const medicalIncidents = incidents.filter(i => i.type === 'medical' && i.status !== 'resolved');

  if (!hospitalNode || !hospitalResources) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-12 gap-5 h-[calc(100vh-7rem)]">
      {/* Left Column */}
      <div className="col-span-3 flex flex-col gap-4">
        <div className="glass-card accent-hospital accent-line-top p-5" style={{ ['--line-color' as any]: 'rgba(59, 130, 246, 0.9)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="label-muted">Available Beds</span>
            <Bed className="h-4 w-4 text-blue-400" style={{ filter: 'drop-shadow(0 0 6px #3b82f680)' }} />
          </div>
          <div className="stat-number stat-gradient-blue">{hospitalResources.beds}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Across all wards</div>
        </div>

        <div className="glass-card accent-hospital accent-line-top p-5" style={{ ['--line-color' as any]: 'rgba(59, 130, 246, 0.9)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="label-muted">ICU Capacity</span>
            <Activity className="h-4 w-4 text-blue-400" style={{ filter: 'drop-shadow(0 0 6px #3b82f680)' }} />
          </div>
          <div className="flex items-end gap-2 mb-3">
            <div className="stat-number stat-gradient-blue">{hospitalResources.icu}</div>
            <span className="text-xs text-muted-foreground mb-1.5">available</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill bar-fill-blue" style={{ width: '40%' }} />
          </div>
        </div>

        <div className="glass-card accent-hospital accent-line-top p-5 flex-1 flex flex-col" style={{ ['--line-color' as any]: 'rgba(239, 68, 68, 0.9)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="label-muted">Blood Stock</span>
            <Droplet className="h-4 w-4 text-red-400" style={{ filter: 'drop-shadow(0 0 6px #ef444480)' }} />
          </div>
          <div className="space-y-3 flex-1">
            {Object.entries(hospitalResources.blood).map(([type, amount]) => (
              <div key={type} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-wider">{type}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">{amount} U</span>
                </div>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${bloodBarClass[type] ?? 'bar-fill-red'}`}
                    style={{ width: `${Math.min(100, (amount / 100) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card accent-hospital p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-sm font-medium">Accepting Trauma</div>
            <div className="text-[11px] text-muted-foreground">Emergency routing active</div>
          </div>
          <Switch checked={hospitalResources.acceptingCases} />
        </div>
      </div>

      {/* Center - Map */}
      <div className="col-span-6 flex flex-col">
        <div className="glass-card accent-hospital flex-1 p-1.5 overflow-hidden relative">
          <div className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-md text-[10px] font-mono tracking-widest"
            style={{ background: 'rgba(5, 4, 20, 0.85)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#93c5fd', boxShadow: '0 0 12px rgba(59, 130, 246, 0.25)' }}>
            FILTER · MEDICAL
          </div>
          <IslamabadMap highlightRole="hospital" />
        </div>
      </div>

      {/* Right Column - Queue */}
      <div className="col-span-3 flex flex-col">
        <div className="glass-card accent-hospital flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-blue-500/20 flex items-center justify-between">
            <span className="label-muted">Medical Triage Queue</span>
            <span className="severity-pill" style={{ background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.5)', color: '#bfdbfe' }}>
              {medicalIncidents.length} Active
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {medicalIncidents.map(inc => (
              <div key={inc.id} className={`incident-row ${inc.severity}`}>
                <div className="flex items-start justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground tracking-wider">{inc.id}</span>
                  <span className={`severity-pill ${inc.severity}`}>{inc.severity}</span>
                </div>
                <div className="text-[13px] font-medium leading-snug">{inc.title}</div>
                <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-1.5">
                  <MapPin className="h-3 w-3" /> {inc.location.address}
                </div>
              </div>
            ))}
            {medicalIncidents.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">No active medical incidents</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
