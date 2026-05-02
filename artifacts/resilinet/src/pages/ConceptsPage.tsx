import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useResiliNet } from '../context/ResiliNetContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Activity, ServerCrash, Share2, Database, ListOrdered, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ConceptsPage() {
  const { nodes, fireEvent, addIncident } = useResiliNet();
  const [activeTab, setActiveTab] = useState('heartbeat');

  // Simulated internal state for demo tabs
  const [serverStateCount, setServerStateCount] = useState(0);
  const [clientSynced, setClientSynced] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  const handleAddIncidentToState = () => {
    setServerStateCount(prev => prev + 1);
    setSyncLogs(prev => [`[Server] State mutated. seq: ${serverStateCount + 1}`, ...prev]);
    if (clientSynced) {
      setTimeout(() => {
        setSyncLogs(prev => [`[Client] Received state update. seq: ${serverStateCount + 1}`, ...prev]);
      }, 500);
    }
  };

  const handleConnectClient = () => {
    setSyncLogs(prev => ['[Client] Connecting to state stream...', ...prev]);
    setTimeout(() => {
      setClientSynced(true);
      setSyncLogs(prev => [`[Client] Initial sync complete. Current seq: ${serverStateCount}`, ...prev]);
      toast.success('Client synchronized via WebSocket');
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold font-mono tracking-tight text-primary">CS-347 PDC Concepts Demo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Interactive demonstrations of the parallel and distributed computing architectures powering the ResiliNet platform.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 h-auto p-1 bg-secondary/50 border border-border/50 rounded-xl mb-6">
          <TabsTrigger value="heartbeat" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"><Activity className="w-4 h-4 mr-2" /> Heartbeat</TabsTrigger>
          <TabsTrigger value="messaging" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"><Share2 className="w-4 h-4 mr-2" /> Messaging</TabsTrigger>
          <TabsTrigger value="fault" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"><ServerCrash className="w-4 h-4 mr-2" /> Fault Tol.</TabsTrigger>
          <TabsTrigger value="state" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"><Database className="w-4 h-4 mr-2" /> State Sync</TabsTrigger>
          <TabsTrigger value="logging" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"><ListOrdered className="w-4 h-4 mr-2" /> Dist. Logs</TabsTrigger>
        </TabsList>

        {/* Tab 1: Heartbeat */}
        <TabsContent value="heartbeat" className="space-y-4">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Heartbeat Health Checks</CardTitle>
              <CardDescription>Nodes emit periodic heartbeats. The cluster manager marks nodes offline if thresholds are exceeded.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {nodes.map(node => {
                  const elapsed = Math.floor((Date.now() - node.lastHeartbeat) / 1000);
                  const isOffline = elapsed > 9 || node.status === 'offline';
                  return (
                    <Card key={node.id} className={`border ${isOffline ? 'border-red-500 bg-red-500/5' : 'border-green-500/30 bg-card'} relative overflow-hidden transition-colors duration-500`}>
                      <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-sm">{node.id}</span>
                          <Badge variant={isOffline ? 'destructive' : 'outline'} className={!isOffline ? 'text-green-500 border-green-500/50' : ''}>
                            {isOffline ? 'OFFLINE' : 'ONLINE'}
                          </Badge>
                        </div>
                        <div className="text-center py-4">
                          <div className={`text-4xl font-bold font-mono ${isOffline ? 'text-red-500' : 'text-foreground'}`}>{elapsed}s</div>
                          <div className="text-xs text-muted-foreground mt-1">Since last heartbeat</div>
                        </div>
                        <div className="flex gap-1 justify-center">
                          {/* Fake tick history */}
                          {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className={`h-4 w-1.5 rounded-full ${i > 10 && isOffline ? 'bg-red-500' : 'bg-green-500'}`} style={{ opacity: 0.3 + (i * 0.05) }} />
                          ))}
                        </div>
                        <div className={`w-full h-8 flex items-center justify-center text-xs rounded font-mono border ${isOffline ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-green-500/30 text-green-400 bg-green-500/10'}`}>
                          {isOffline ? 'Waiting for heartbeat…' : 'Heartbeat active'}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
              <div className="mt-6 text-center text-sm font-mono text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/50">
                PDC CONFIG: Emit interval = 3s | Timeout threshold = 9s | Consensus = Raft
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Messaging */}
        <TabsContent value="messaging" className="space-y-4">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Event-Driven Pub/Sub Architecture</CardTitle>
              <CardDescription>Decoupled communication via centralized event bus (simulating Redis/RabbitMQ).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-8 py-8">
                {/* Producers */}
                <div className="flex gap-4 w-full justify-center">
                  <div className="border border-border/50 bg-secondary/30 px-4 py-2 rounded font-mono text-xs text-muted-foreground">Client UI</div>
                  <div className="border border-border/50 bg-secondary/30 px-4 py-2 rounded font-mono text-xs text-muted-foreground">API Gateway</div>
                  <div className="border border-border/50 bg-secondary/30 px-4 py-2 rounded font-mono text-xs text-muted-foreground">Scheduler</div>
                </div>
                
                {/* Arrows Down */}
                <div className="flex gap-16 text-muted-foreground/30">
                  <ArrowRight className="rotate-90" />
                  <ArrowRight className="rotate-90" />
                  <ArrowRight className="rotate-90" />
                </div>

                {/* Event Bus */}
                <div className="w-full max-w-lg border-2 border-primary bg-primary/5 rounded-xl p-6 text-center relative group">
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                  <h3 className="font-bold text-xl text-primary mb-2">Central Event Bus</h3>
                  <div className="flex justify-center gap-2 mb-4">
                    <Badge variant="outline" className="border-primary/50 text-primary">topic: INCIDENTS</Badge>
                    <Badge variant="outline" className="border-primary/50 text-primary">topic: HEARTBEAT</Badge>
                  </div>
                  <Button 
                    onClick={() => {
                      fireEvent('INCIDENT_CREATED', 'Demo manual event fired from PDC tab');
                      toast.success('Event published to bus');
                    }}
                    className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/50"
                  >
                    Publish Test Event
                  </Button>
                </div>

                {/* Arrows Down */}
                <div className="flex gap-32 text-primary/50">
                  <ArrowRight className="rotate-90" />
                  <ArrowRight className="rotate-90" />
                </div>

                {/* Subscribers */}
                <div className="flex gap-8 w-full justify-center">
                  <Card className="w-64 border-blue-500/30 bg-blue-500/5">
                    <CardHeader className="p-3 border-b border-blue-500/20"><CardTitle className="text-sm">Hospital Node Sub</CardTitle></CardHeader>
                    <CardContent className="p-3 text-xs font-mono text-muted-foreground h-24 overflow-hidden flex flex-col justify-end">
                      <div className="text-blue-400">Listening...</div>
                    </CardContent>
                  </Card>
                  <Card className="w-64 border-teal-500/30 bg-teal-500/5">
                    <CardHeader className="p-3 border-b border-teal-500/20"><CardTitle className="text-sm">Ambulance Node Sub</CardTitle></CardHeader>
                    <CardContent className="p-3 text-xs font-mono text-muted-foreground h-24 overflow-hidden flex flex-col justify-end">
                      <div className="text-teal-400">Listening...</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Fault Tolerance */}
        <TabsContent value="fault" className="space-y-4">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Fault Tolerance & Rerouting</CardTitle>
              <CardDescription>If a node fails, traffic is transparently rerouted to surviving nodes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 mb-8">
                 {nodes.map(node => (
                   <div key={node.id} className={`p-4 rounded-xl border ${node.status === 'online' ? 'border-border/50 bg-secondary/20' : 'border-destructive/50 bg-destructive/10'} text-center space-y-4`}>
                     <div className="font-mono font-bold">{node.id}</div>
                     <div className="text-xs text-muted-foreground">Load Capacity</div>
                     <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                       <div className={`h-full ${node.status === 'online' ? 'bg-primary' : 'bg-destructive'}`} style={{ width: node.status === 'online' ? '33%' : '0%' }}></div>
                     </div>
                      <div className={`px-3 py-1.5 rounded text-xs font-mono border ${node.status === 'online' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                        {node.status === 'online' ? '● Live' : '○ Offline'}
                      </div>
                   </div>
                 ))}
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 text-sm">
                <strong>Simulated behavior:</strong> When you crash a node, the ResiliNetContext immediately intercepts operations targeted at that node and logs a FAILOVER event, representing an HAProxy or load-balancer reroute.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: State Sync */}
        <TabsContent value="state" className="space-y-4">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>State Synchronization (Event Sourcing)</CardTitle>
              <CardDescription>Ensuring eventual consistency across distributed clients.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-8">
                {/* Server */}
                <div className="space-y-4">
                  <div className="font-mono text-sm font-bold flex items-center justify-between p-2 border-b border-border">
                    Server State (Primary)
                    <Badge variant="outline">Seq: {serverStateCount}</Badge>
                  </div>
                  <div className="p-4 bg-secondary/20 border border-border/50 rounded-lg h-48 flex items-center justify-center">
                    <Button onClick={handleAddIncidentToState} variant="secondary" className="border border-border">Mutate State (Add Item)</Button>
                  </div>
                </div>

                {/* Client */}
                <div className="space-y-4">
                  <div className="font-mono text-sm font-bold flex items-center justify-between p-2 border-b border-border">
                    Client State (Replica)
                    <Badge variant={clientSynced ? 'default' : 'destructive'} className={clientSynced ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : ''}>
                      {clientSynced ? `Synced (Seq: ${serverStateCount})` : 'Disconnected'}
                    </Badge>
                  </div>
                  <div className="p-4 bg-secondary/20 border border-border/50 rounded-lg h-48 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                    {!clientSynced ? (
                      <Button onClick={handleConnectClient} className="bg-primary">Connect & Hydrate</Button>
                    ) : (
                      <div className="absolute inset-0 p-4 font-mono text-xs text-green-400/80 overflow-auto flex flex-col justify-end space-y-1">
                        {Array.from({ length: serverStateCount }).map((_, i) => (
                          <div key={i}>&gt; {`{ state: 'mutated', seq: ${i+1} }`}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 border-t border-border/50 pt-4">
                <div className="text-xs font-mono text-muted-foreground mb-2">SYNC LOGS</div>
                <div className="bg-black/50 border border-white/5 rounded-lg p-3 font-mono text-[10px] h-32 overflow-auto space-y-1 text-muted-foreground">
                  {syncLogs.length === 0 ? 'Awaiting operations...' : syncLogs.map((log, i) => (
                    <div key={i} className={log.includes('[Server]') ? 'text-blue-400' : 'text-green-400'}>{log}</div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Distributed Logging */}
        <TabsContent value="logging" className="space-y-4">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Distributed Append-Only Logs</CardTitle>
              <CardDescription>Immutable audit trails for distributed systems.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => fireEvent('INCIDENT_CREATED', 'Demo: Critical mass casualty incident logged')}>Fire INCIDENT_CREATED</Button>
                <Button size="sm" variant="outline" onClick={() => fireEvent('NODE_OFFLINE', 'Demo: Node timeout simulated', 'DEMO-NODE')}>Fire NODE_OFFLINE</Button>
                <Button size="sm" variant="outline" onClick={() => fireEvent('FAILOVER', 'Demo: Cluster master re-election triggered')}>Fire FAILOVER</Button>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground">
                  The actual log implementation is active on the <a href="/events" className="text-primary hover:underline">Event Log</a> page. 
                  In a real PDC implementation, these events are collected from all nodes via agents like Fluentd, shipped to a centralized Kafka topic, and indexed in Elasticsearch.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
