import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useResiliNet } from '../context/ResiliNetContext';
import { Node } from '../lib/types';

export default function HospitalPortal() {
  const { nodes } = useResiliNet();
  const hospitalNode = nodes.find(n => n.type === 'hospital') as Node;
  
  if (!hospitalNode) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-500">Hospital Administration Portal</h1>
      <Card className="glass-card border-blue-500/30">
        <CardHeader>
          <CardTitle>Node Configuration: {hospitalNode.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div className="text-sm text-muted-foreground">Node ID</div>
              <div className="font-mono">{hospitalNode.id}</div>
            </div>
            <div className="space-y-2 p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="text-green-500 font-bold uppercase">{hospitalNode.status}</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            This portal allows administrators to manage hospital resources and configure node settings. 
            In a full implementation, forms here would update the global state. For this demo, state is simulated.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
