import React from 'react';
import { Badge } from './ui/badge';
import { IncidentSeverity } from '../lib/types';

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  switch (severity) {
    case 'critical':
      return <Badge variant="destructive" className="animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">CRITICAL</Badge>;
    case 'moderate':
      return <Badge variant="default" className="bg-amber-500/20 text-amber-500 border-amber-500/50 hover:bg-amber-500/30">MODERATE</Badge>;
    case 'low':
      return <Badge variant="default" className="bg-blue-500/20 text-blue-500 border-blue-500/50 hover:bg-blue-500/30">LOW</Badge>;
    case 'resolved':
      return <Badge variant="outline" className="text-muted-foreground">RESOLVED</Badge>;
    default:
      return <Badge variant="outline">{severity}</Badge>;
  }
}
