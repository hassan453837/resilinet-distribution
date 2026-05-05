import React, { useEffect, useMemo, useState } from 'react';
import { useResiliNet } from '../context/ResiliNetContext';
import IslamabadMap from '../components/IslamabadMap';
import { StatCard } from '../components/StatCard';
import { Activity, CheckCircle2, Navigation, Truck, Fuel, MapPin, Loader2 } from 'lucide-react';
import { Node } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

const DEFAULT_AMBULANCE_RESOURCES = {
  unitsAvailable: 0,
  unitsOnDuty: 0,
  totalUnits: 0,
  fuelLevel: 0,
};

export default function AmbulanceDashboard() {
  const { nodes, incidents, updateNodeResources, fireEvent } = useResiliNet();
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_AMBULANCE_RESOURCES);

  // Find the node assigned to this user
  const ambulanceNode = nodes.find(n => n.id === user?.node_id) as Node;

  // Defensive check: Normalize resource fields across legacy/new DB shapes
  const ambulanceResources = useMemo(() => ({
    unitsAvailable: ambulanceNode?.resources?.ambulance?.unitsAvailable ?? 0,
    unitsOnDuty: ambulanceNode?.resources?.ambulance?.unitsOnDuty ?? 0,
    totalUnits: ambulanceNode?.resources?.ambulance?.totalUnits ?? 0,
    fuelLevel: ambulanceNode?.resources?.ambulance?.fuelLevel ?? 0,
  }), [ambulanceNode]);

  useEffect(() => {
    if (editOpen) {
      setDraft(ambulanceResources);
    }
  }, [editOpen, ambulanceResources]);

  const assignedIncidents = incidents.filter(
    i => i.assignedNodeId === ambulanceNode?.id && i.status !== 'resolved'
  );

  // Diagnostic Log - Check your console if it's still stuck
  console.log("AMBULANCE_DATA_CHECK:", {
    targetId: user?.node_id,
    nodeFound: !!ambulanceNode,
    resourcesFound: !!ambulanceNode?.resources?.ambulance
  });

  const handleAmbulanceSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ambulanceNode) return;

    setIsSaving(true);
    try {
      await updateNodeResources(ambulanceNode.id, {
        ambulance: {
          ...draft,
        },
      });
      fireEvent('STATUS_UPDATED', `Ambulance ${ambulanceNode.id} updated resource stats`, ambulanceNode.id);
      setEditOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

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

        <div className="glass-card accent-ambulance p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Edit Stats</div>
            <div className="text-[11px] text-muted-foreground">Update unit counts and fleet fuel level.</div>
          </div>
          <Button type="button" variant="outline" className="mt-3 w-full border-teal-500/20 bg-teal-500/10 text-teal-100 hover:bg-teal-500/20" onClick={() => setEditOpen(true)}>
            Open Editor
          </Button>
        </div>
      </div>

      <div className="col-span-9 flex flex-col">
        <div className="glass-card accent-ambulance flex-1 p-1.5 overflow-hidden relative">
          <div className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-md text-[10px] font-mono tracking-widest"
            style={{ background: 'rgba(5, 4, 20, 0.85)', border: '1px solid rgba(20, 184, 166, 0.4)', color: '#5eead4', boxShadow: '0 0 12px rgba(20, 184, 166, 0.25)' }}>
            UNIT · AMB-B82
          </div>
          <IslamabadMap highlightRole="ambulance" />
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border border-teal-500/20 bg-card/95 backdrop-blur-xl sm:max-w-xl">
          <form onSubmit={handleAmbulanceSave} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Edit Ambulance Stats</DialogTitle>
              <DialogDescription>
                Update the resource values shown on the left panel.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Units Available</label>
                <Input type="number" min={0} value={draft.unitsAvailable} onChange={(event) => setDraft(prev => ({ ...prev, unitsAvailable: Number(event.target.value) }))} className="bg-secondary/50 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Units On Duty</label>
                <Input type="number" min={0} value={draft.unitsOnDuty} onChange={(event) => setDraft(prev => ({ ...prev, unitsOnDuty: Number(event.target.value) }))} className="bg-secondary/50 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total Units</label>
                <Input type="number" min={0} value={draft.totalUnits} onChange={(event) => setDraft(prev => ({ ...prev, totalUnits: Number(event.target.value) }))} className="bg-secondary/50 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Fuel Level (%)</label>
                <Input type="number" min={0} max={100} value={draft.fuelLevel} onChange={(event) => setDraft(prev => ({ ...prev, fuelLevel: Number(event.target.value) }))} className="bg-secondary/50 border-white/10" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="border-white/10">Cancel</Button>
              <Button type="submit" disabled={isSaving} className="bg-teal-500 text-slate-950 hover:bg-teal-400">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
