import React, { useState } from 'react';
import { useResiliNet } from '../context/ResiliNetContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Search, Filter } from 'lucide-react';
import { EventType } from '../lib/types';

const getEventColor = (type: EventType) => {
  switch (type) {
    case 'INCIDENT_CREATED': return 'text-red-400 bg-red-500/10 border-red-500/20';
    case 'NODE_ONLINE': return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'NODE_OFFLINE': return 'text-red-500 bg-red-500/20 border-red-500/50 animate-pulse';
    case 'UNIT_DISPATCHED': return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
    case 'STATUS_UPDATED': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'FAILOVER': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'NODE_RECOVERED': return 'text-green-400 bg-green-500/10 border-green-500/20';
    default: return 'text-muted-foreground bg-secondary/50 border-border/50';
  }
};

export default function EventLogPage() {
  const { events } = useResiliNet();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<EventType | 'ALL'>('ALL');

  const filteredEvents = events.filter(evt => {
    const matchesSearch = evt.message.toLowerCase().includes(search.toLowerCase()) || 
                          evt.id.toLowerCase().includes(search.toLowerCase()) ||
                          (evt.nodeId && evt.nodeId.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'ALL' || evt.type === filterType;
    return matchesSearch && matchesType;
  });

  const eventTypes: (EventType | 'ALL')[] = ['ALL', 'INCIDENT_CREATED', 'NODE_ONLINE', 'NODE_OFFLINE', 'UNIT_DISPATCHED', 'STATUS_UPDATED', 'FAILOVER', 'NODE_RECOVERED'];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <Card className="glass-card border-primary/20 bg-card/40 shrink-0">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search events by ID, message, or node..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-secondary/50 border-white/10"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-muted-foreground mr-1" />
            {eventTypes.map(type => (
              <Badge 
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                className={`cursor-pointer ${filterType === type ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'}`}
                onClick={() => setFilterType(type)}
              >
                {type.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 glass-card border-border/50 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1 p-0">
          <table className="w-full text-sm text-left relative">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/80 border-b border-border/50 sticky top-0 z-10 backdrop-blur">
              <tr>
                <th className="px-4 py-3 font-medium w-32">Timestamp</th>
                <th className="px-4 py-3 font-medium w-48">Event Type</th>
                <th className="px-4 py-3 font-medium w-32">Node ID</th>
                <th className="px-4 py-3 font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((evt, idx) => (
                <tr 
                  key={evt.id} 
                  className={`border-b border-border/20 hover:bg-secondary/30 transition-colors animate-in slide-in-from-top-2 fade-in duration-300`}
                  style={{ animationDelay: `${Math.min(idx * 50, 500)}ms`, animationFillMode: 'both' }}
                >
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                    {new Date(evt.timestamp).toISOString().split('T')[1].slice(0, 12)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-[10px] uppercase border ${getEventColor(evt.type)}`}>
                      {evt.type.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{evt.nodeId || '-'}</td>
                  <td className="px-4 py-3 text-sm text-foreground/90">{evt.message}</td>
                </tr>
              ))}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">No events found matching criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
