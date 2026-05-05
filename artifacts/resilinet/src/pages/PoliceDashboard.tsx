import React, { useEffect, useMemo, useState } from 'react';
import { useResiliNet } from '../context/ResiliNetContext';
import IslamabadMap from '../components/IslamabadMap';
import { Shield, ShieldAlert, ShieldCheck, MapPin, Crosshair } from 'lucide-react';
import { Node } from '../lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
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

const DEFAULT_POLICE_RESOURCES = {
  unitsAvailable: 0,
  unitsOnPatrol: 0,
  totalUnits: 0,
  activeZone: 'Blue Area',
  armed: false,
};

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
  const { nodes = [], incidents = [], updateNodeResources, fireEvent } = useResiliNet();
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_POLICE_RESOURCES);

  // Find the specific precinct node assigned to this user
  const policeNode = nodes.find(n => n.id === user?.node_id) as Node;

  // Normalize resources to ensure all expected keys exist
  const policeResources = useMemo(() => {
    const raw = (policeNode?.resources?.police || {}) as any;
    return {
      unitsAvailable: raw.unitsAvailable ?? DEFAULT_POLICE_RESOURCES.unitsAvailable,
      unitsOnPatrol: raw.unitsOnPatrol ?? DEFAULT_POLICE_RESOURCES.unitsOnPatrol,
      totalUnits: raw.totalUnits ?? DEFAULT_POLICE_RESOURCES.totalUnits,
      activeZone: raw.activeZone ?? DEFAULT_POLICE_RESOURCES.activeZone,
      armed: raw.armed ?? DEFAULT_POLICE_RESOURCES.armed,
    };
  }, [policeNode]);

  useEffect(() => {
    if (editOpen) {
      setDraft(policeResources);
    }
  }, [editOpen, policeResources]);

  const crimeIncidents = incidents.filter(
    (i) => i.type === 'crime' && i.status !== 'resolved'
  );

  const handleArmedToggle = (armed: boolean) => {
    updateNodeResources(policeNode.id, {
      police: {
        ...policeResources,
        armed,
      },
    });

    fireEvent(
      'STATUS_UPDATED',
      `Police ${policeNode.id} ${armed ? 'enabled' : 'disabled'} armed response`,
      policeNode.id
    );
  };

  const handlePoliceSave = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsSaving(true);
    try {
      await updateNodeResources(policeNode.id, {
        police: {
          ...draft,
        },
      });
      fireEvent('STATUS_UPDATED', `Police ${policeNode.id} updated resource stats`, policeNode.id);
      setEditOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

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
          <Switch checked={policeResources.armed} onCheckedChange={handleArmedToggle} className="data-[state=checked]:bg-violet-500" />
        </div>

        <div className="glass-card accent-police p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Edit Stats</div>
            <div className="text-[11px] text-muted-foreground">Update unit counts, patrol zone, and armed response.</div>
          </div>
          <Button type="button" variant="outline" className="mt-3 w-full border-violet-500/20 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20" onClick={() => setEditOpen(true)}>
            Open Editor
          </Button>
        </div>
      </div>

      <div className="col-span-9 flex flex-col">
        <div className="glass-card accent-police flex-1 p-1.5 overflow-hidden relative">
          <div className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-md text-[10px] font-mono tracking-widest"
            style={{ background: 'rgba(5, 4, 20, 0.85)', border: '1px solid rgba(139, 92, 246, 0.4)', color: '#c4b5fd', boxShadow: '0 0 12px rgba(139, 92, 246, 0.25)' }}>
            OVERLAY · {policeResources.activeZone.toUpperCase()}
          </div>
          <IslamabadMap highlightRole="police" />
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border border-violet-500/20 bg-card/95 backdrop-blur-xl sm:max-w-xl">
          <form onSubmit={handlePoliceSave} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Edit Police Stats</DialogTitle>
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
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Units On Patrol</label>
                <Input type="number" min={0} value={draft.unitsOnPatrol} onChange={(event) => setDraft(prev => ({ ...prev, unitsOnPatrol: Number(event.target.value) }))} className="bg-secondary/50 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total Units</label>
                <Input type="number" min={0} value={draft.totalUnits} onChange={(event) => setDraft(prev => ({ ...prev, totalUnits: Number(event.target.value) }))} className="bg-secondary/50 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Patrol Zone</label>
                <Select value={draft.activeZone} onValueChange={(value) => setDraft(prev => ({ ...prev, activeZone: value }))}>
                  <SelectTrigger className="border-white/10 bg-white/5 text-sm">
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
            </div>

            <label className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm">
              <span>
                <span className="block font-medium text-white">Armed Response</span>
                <span className="block text-xs text-muted-foreground">Enable or disable tactical response mode.</span>
              </span>
              <Switch checked={draft.armed} onCheckedChange={(checked) => setDraft(prev => ({ ...prev, armed: checked }))} className="data-[state=checked]:bg-violet-500" />
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="border-white/10">Cancel</Button>
              <Button type="submit" disabled={isSaving} className="bg-violet-500 text-white hover:bg-violet-500/90">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
