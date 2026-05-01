import React, { useState } from 'react';
import { useResiliNet } from '../context/ResiliNetContext';
import IslamabadMap from '../components/IslamabadMap';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Layers } from 'lucide-react';

export default function MapPage() {
  const { incidents, nodes } = useResiliNet();
  const [showHeatmap, setShowHeatmap] = useState(false);

  return (
    <div className="h-[calc(100vh-8rem)] relative rounded-xl overflow-hidden border border-border/50">
      <IslamabadMap showHeatmap={showHeatmap} />
      
      {/* Top Left - Legend */}
      <Card className="absolute top-4 left-4 z-[400] glass-card border-primary/20 w-48 shadow-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="text-xs font-mono font-bold text-muted-foreground mb-2">MAP LEGEND</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <span>Hospital Node</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
              <span>Ambulance Node</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
              <span>Police Node</span>
            </div>
            <div className="h-[1px] bg-border my-2" />
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full border-2 border-white bg-red-500 animate-pulse" />
              <span>Critical Incident</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full border-2 border-white bg-amber-500" />
              <span>Moderate Incident</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Right - Controls */}
      <Card className="absolute top-4 right-4 z-[400] glass-card border-primary/20 shadow-2xl">
        <CardContent className="p-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Density Heatmap</span>
          </div>
          <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
        </CardContent>
      </Card>

      {/* Bottom Left - Stats Summary */}
      <Card className="absolute bottom-4 left-4 z-[400] glass-card border-primary/20 shadow-2xl">
        <CardContent className="p-4 flex gap-6">
          <div>
            <div className="text-2xl font-bold">{nodes.filter(n => n.status === 'online').length}/{nodes.length}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Nodes Online</div>
          </div>
          <div className="w-[1px] bg-border" />
          <div>
            <div className="text-2xl font-bold text-red-500">{incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Critical</div>
          </div>
          <div className="w-[1px] bg-border" />
          <div>
            <div className="text-2xl font-bold text-primary">{incidents.filter(i => i.status !== 'resolved').length}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Active</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
