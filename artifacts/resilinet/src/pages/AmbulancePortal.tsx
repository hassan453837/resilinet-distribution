import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useResiliNet } from '../context/ResiliNetContext';
import { Node } from '../lib/types';

export default function AmbulancePortal() {
  const { nodes } = useResiliNet();
  const ambulanceNode = nodes.find(n => n.type === 'ambulance') as Node;
  
  if (!ambulanceNode) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-teal-500">Ambulance Dispatch Portal</h1>
      <Card className="glass-card border-teal-500/30">
        <CardHeader>
          <CardTitle>Fleet Command: {ambulanceNode.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div className="text-sm text-muted-foreground">Node ID</div>
              <div className="font-mono">{ambulanceNode.id}</div>
            </div>
            <div className="space-y-2 p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="text-green-500 font-bold uppercase">{ambulanceNode.status}</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Manage fleet deployment, track GPS units, and coordinate with hospital nodes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
