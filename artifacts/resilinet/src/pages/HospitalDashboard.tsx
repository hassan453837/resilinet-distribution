import React, { useEffect, useMemo, useState } from 'react';
import { useResiliNet } from '../context/ResiliNetContext';
import IslamabadMap from '../components/IslamabadMap';
import { Switch } from '../components/ui/switch';
import { Activity, Bed, Droplet } from 'lucide-react';
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

const DEFAULT_HOSPITAL_RESOURCES = {
  beds: 0,
  icu: 0,
  blood: { 'O+': 0, 'O-': 0, 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0 },
  acceptingCases: false,
};

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
  const { nodes, incidents, updateNodeResources, fireEvent } = useResiliNet();
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_HOSPITAL_RESOURCES);
  
  const hospitalNode = nodes.find(n => n.id === user?.node_id);

  // Normalize database resources with defaults to avoid missing subkeys
  const hospitalResources = useMemo(() => {
    const raw = (hospitalNode?.resources?.hospital || {}) as any;
    return {
      beds: raw.beds ?? DEFAULT_HOSPITAL_RESOURCES.beds,
      icu: raw.icu ?? DEFAULT_HOSPITAL_RESOURCES.icu,
      blood: {
        'O+': raw.blood?.['O+'] ?? DEFAULT_HOSPITAL_RESOURCES.blood['O+'],
        'O-': raw.blood?.['O-'] ?? DEFAULT_HOSPITAL_RESOURCES.blood['O-'],
        'A+': raw.blood?.['A+'] ?? DEFAULT_HOSPITAL_RESOURCES.blood['A+'],
        'A-': raw.blood?.['A-'] ?? DEFAULT_HOSPITAL_RESOURCES.blood['A-'],
        'B+': raw.blood?.['B+'] ?? DEFAULT_HOSPITAL_RESOURCES.blood['B+'],
        'B-': raw.blood?.['B-'] ?? DEFAULT_HOSPITAL_RESOURCES.blood['B-'],
        'AB+': raw.blood?.['AB+'] ?? DEFAULT_HOSPITAL_RESOURCES.blood['AB+'],
        'AB-': raw.blood?.['AB-'] ?? DEFAULT_HOSPITAL_RESOURCES.blood['AB-'],
      },
      acceptingCases: raw.acceptingCases ?? DEFAULT_HOSPITAL_RESOURCES.acceptingCases,
    };
  }, [hospitalNode]);

  useEffect(() => {
    if (editOpen) {
      setDraft(hospitalResources);
    }
  }, [editOpen, hospitalResources]);

  const medicalIncidents = incidents.filter(i => i.type === 'medical' && i.status !== 'resolved');

  const handleTraumaToggle = (acceptingCases: boolean) => {
    if (!hospitalNode) return;

    updateNodeResources(hospitalNode.id, {
      hospital: {
        ...hospitalResources,
        acceptingCases,
      },
    });

    fireEvent(
      'STATUS_UPDATED',
      `Hospital ${hospitalNode.id} ${acceptingCases ? 'enabled' : 'disabled'} trauma acceptance`,
      hospitalNode.id
    );
  };

  const handleHospitalSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!hospitalNode) return;

    setIsSaving(true);
    try {
      await updateNodeResources(hospitalNode.id, {
        hospital: {
          ...draft,
        },
      });
      fireEvent('STATUS_UPDATED', `Hospital ${hospitalNode.id} updated resource stats`, hospitalNode.id);
      setEditOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Remove the strict "if (!hospitalResources) return..." line
  if (!hospitalNode) return <div className="p-10 text-white">Connecting to Node: {user?.node_id}...</div>;
    // ... rest of your UI code will now work because hospitalResources is never undefined
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
          <Switch checked={hospitalResources.acceptingCases} onCheckedChange={handleTraumaToggle} />
        </div>

        <div className="glass-card accent-hospital p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Edit Stats</div>
            <div className="text-[11px] text-muted-foreground">Update beds, ICU, blood stock, and trauma acceptance.</div>
          </div>
          <Button type="button" variant="outline" className="mt-3 w-full border-blue-500/20 bg-blue-500/10 text-blue-100 hover:bg-blue-500/20" onClick={() => setEditOpen(true)}>
            Open Editor
          </Button>
        </div>
      </div>

      {/* Center - Map */}
      <div className="col-span-9 flex flex-col">
        <div className="glass-card accent-hospital flex-1 p-1.5 overflow-hidden relative">
          <div className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-md text-[10px] font-mono tracking-widest"
            style={{ background: 'rgba(5, 4, 20, 0.85)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#93c5fd', boxShadow: '0 0 12px rgba(59, 130, 246, 0.25)' }}>
            FILTER · MEDICAL
          </div>
          <IslamabadMap highlightRole="hospital" />
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border border-blue-500/20 bg-card/95 backdrop-blur-xl sm:max-w-2xl">
          <form onSubmit={handleHospitalSave} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Edit Hospital Stats</DialogTitle>
              <DialogDescription>
                Update the resource values shown on the left panel.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Beds</label>
                <Input type="number" min={0} value={draft.beds} onChange={(event) => setDraft(prev => ({ ...prev, beds: Number(event.target.value) }))} className="bg-secondary/50 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">ICU</label>
                <Input type="number" min={0} value={draft.icu} onChange={(event) => setDraft(prev => ({ ...prev, icu: Number(event.target.value) }))} className="bg-secondary/50 border-white/10" />
              </div>
              {Object.keys(draft.blood).map((type) => (
                <div key={type} className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{type} Units</label>
                  <Input
                    type="number"
                    min={0}
                    value={draft.blood[type as keyof typeof draft.blood]}
                    onChange={(event) => setDraft(prev => ({
                      ...prev,
                      blood: {
                        ...prev.blood,
                        [type]: Number(event.target.value),
                      },
                    }))}
                    className="bg-secondary/50 border-white/10"
                  />
                </div>
              ))}
            </div>

            <label className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm">
              <span>
                <span className="block font-medium text-white">Accepting Trauma</span>
                <span className="block text-xs text-muted-foreground">Enable or disable emergency trauma intake.</span>
              </span>
              <Switch checked={draft.acceptingCases} onCheckedChange={(checked) => setDraft(prev => ({ ...prev, acceptingCases: checked }))} />
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="border-white/10">Cancel</Button>
              <Button type="submit" disabled={isSaving} className="bg-blue-500 text-white hover:bg-blue-500/90">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
