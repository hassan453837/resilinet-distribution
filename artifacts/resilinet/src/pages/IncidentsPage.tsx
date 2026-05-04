import React, { useState } from 'react';
import { useResiliNet } from '../context/ResiliNetContext';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { SeverityBadge } from '../components/SeverityBadge';
import { LayoutGrid, List, Search, SlidersHorizontal, CheckCircle, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Incident } from '../lib/types';
import { Textarea } from '../components/ui/textarea';

export default function IncidentsPage() {
  const { incidents, resolveIncident, nodes } = useResiliNet();
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [search, setSearch] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const filteredIncidents = incidents.filter(inc => 
    inc.title.toLowerCase().includes(search.toLowerCase()) || 
    inc.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleResolve = (id: string) => {
    resolveIncident(id, resolutionNote || 'Resolved by operator');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#14b8a6', '#8b5cf6']
    });
    setSelectedIncident(null);
    setResolutionNote('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Main Content */}
      <div className={`flex flex-col gap-4 transition-all duration-300 ${selectedIncident ? 'w-2/3' : 'w-full'}`}>
        <Card className="glass-card border-primary/20 bg-card/40">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search incidents by ID or title..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50 border-white/10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Link href="/incidents/create">
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="w-4 h-4" />
                  New Incident
                </Button>
              </Link>
              <Button variant="outline" size="icon" className="border-white/10 bg-secondary/50">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
              <div className="h-8 w-[1px] bg-border mx-2" />
              <Button 
                variant={view === 'cards' ? 'secondary' : 'ghost'} 
                size="icon" 
                onClick={() => setView('cards')}
                className="border-white/10"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button 
                variant={view === 'table' ? 'secondary' : 'ghost'} 
                size="icon" 
                onClick={() => setView('table')}
                className="border-white/10"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 overflow-auto">
          {view === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredIncidents.map(inc => (
                <Card 
                  key={inc.id} 
                  className={`glass-card cursor-pointer transition-all hover:scale-[1.02] ${selectedIncident?.id === inc.id ? 'border-primary ring-1 ring-primary/50' : 'border-border/50 hover:border-primary/50'}`}
                  onClick={() => setSelectedIncident(inc)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs text-muted-foreground">{inc.id}</span>
                      <SeverityBadge severity={inc.severity} />
                    </div>
                    <div className="font-medium leading-tight">{inc.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{inc.location.address}</div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <Badge variant="outline" className="text-[10px] uppercase bg-secondary/20">{inc.status}</Badge>
                      <span className="text-[10px] text-muted-foreground">{new Date(inc.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/20 border-b border-border/50">
                    <tr>
                      <th className="px-4 py-3 font-medium">ID</th>
                      <th className="px-4 py-3 font-medium">Severity</th>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncidents.map(inc => (
                      <tr 
                        key={inc.id} 
                        className={`border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors ${selectedIncident?.id === inc.id ? 'bg-primary/10' : ''}`}
                        onClick={() => setSelectedIncident(inc)}
                      >
                        <td className="px-4 py-3 font-mono text-xs">{inc.id}</td>
                        <td className="px-4 py-3"><SeverityBadge severity={inc.severity} /></td>
                        <td className="px-4 py-3 font-medium">{inc.title}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className="text-[10px] uppercase">{inc.status}</Badge></td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(inc.createdAt).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Side Panel */}
      {selectedIncident && (
        <Card className="w-1/3 glass-card border-primary/30 flex flex-col shadow-2xl shadow-primary/5 animate-in slide-in-from-right-8 duration-300">
          <CardHeader className="border-b border-border/50 pb-4 bg-secondary/10">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="outline" className="font-mono bg-background">{selectedIncident.id}</Badge>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-muted-foreground" onClick={() => setSelectedIncident(null)}>Close</Button>
            </div>
            <CardTitle className="text-xl">{selectedIncident.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <SeverityBadge severity={selectedIncident.severity} />
              <Badge variant="secondary" className="uppercase">{selectedIncident.type}</Badge>
              <Badge variant="outline" className="uppercase bg-background">{selectedIncident.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Description</div>
                <div className="text-sm leading-relaxed">{selectedIncident.description}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Location</div>
                  <div className="text-sm">{selectedIncident.location.address}</div>
                  <div className="text-xs text-muted-foreground font-mono">{selectedIncident.location.lat.toFixed(4)}, {selectedIncident.location.lng.toFixed(4)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Reported</div>
                  <div className="text-sm">{new Date(selectedIncident.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {selectedIncident.assignedNodeId && (
                <div className="space-y-2 p-3 bg-secondary/20 rounded-lg border border-border/50">
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Assigned Node</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">{nodes.find(n => n.id === selectedIncident.assignedNodeId)?.name || selectedIncident.assignedNodeId}</span>
                  </div>
                </div>
              )}

              {selectedIncident.status === 'resolved' && selectedIncident.resolutionNote && (
                <div className="space-y-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20 text-green-400">
                  <div className="text-xs font-mono uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Resolution Note
                  </div>
                  <div className="text-sm">{selectedIncident.resolutionNote}</div>
                  <div className="text-xs opacity-70">Resolved at: {new Date(selectedIncident.resolvedAt!).toLocaleString()}</div>
                </div>
              )}
            </div>
          </CardContent>
          
          {selectedIncident.status !== 'resolved' && (
            <div className="p-4 border-t border-border/50 bg-secondary/10 space-y-3">
              <Textarea 
                placeholder="Enter resolution notes..." 
                className="min-h-[80px] bg-background border-white/10 resize-none text-sm"
                value={resolutionNote}
                onChange={e => setResolutionNote(e.target.value)}
              />
              <Button 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                onClick={() => handleResolve(selectedIncident.id)}
              >
                MARK AS RESOLVED
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
