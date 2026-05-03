import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useResiliNet } from '../context/ResiliNetContext';
import { LiveClock } from './LiveClock';
import { Button } from './ui/button';
import { LogOut, Shield, AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';

export function TopBar() {
  const { username, role, logout } = useAuth();
  const { incidents } = useResiliNet();
  const [location] = useLocation();

  const getPageTitle = () => {
    switch (location) {
      case '/dashboard': return 'Command Center';
      case '/map': return 'Live Operations Map';
      case '/incidents': return 'Incident Logs';
      case '/analytics': return 'Cluster Analytics';
      case '/events': return 'Real-time Events';
      case '/concepts': return 'PDC Architecture';
      case '/hospital': return 'Hospital Portal';
      case '/ambulance': return 'Ambulance Portal';
      case '/police': return 'Police Portal';
      default: return location.substring(1).toUpperCase() || 'RESILINET';
    }
  };

  const roleBadgeStyle = () => {
    switch (role) {
      case 'hospital': return { color: '#93c5fd', bg: 'rgba(37, 99, 235, 0.12)', border: 'rgba(37, 99, 235, 0.5)', dot: '#3b82f6' };
      case 'ambulance': return { color: '#5eead4', bg: 'rgba(20, 184, 166, 0.12)', border: 'rgba(20, 184, 166, 0.5)', dot: '#14b8a6' };
      case 'police': return { color: '#c4b5fd', bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.5)', dot: '#8b5cf6' };
      default: return { color: '#e5e7eb', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', dot: '#a1a1aa' };
    }
  };

  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
  const role_style = roleBadgeStyle();

  return (
    <header className="topbar-surface h-16 fixed top-0 w-full z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(34,211,238,0.15))', border: '1px solid rgba(139,92,246,0.4)' }}>
            <Shield className="h-4 w-4 text-violet-300" />
          </div>
          <span className="font-mono font-bold tracking-[0.2em] text-base gradient-text">RESILINET</span>
        </div>
        <div className="h-4 w-px bg-violet-500/20 mx-2" />
        <h1 className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">{getPageTitle()}</h1>
      </div>

      <div className="flex flex-1 items-center justify-center gap-3 px-8" />

      <div className="flex items-center gap-5">
        {criticalCount > 0 && (
          <div className="critical-alert flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3" />
            {criticalCount} CRITICAL
          </div>
        )}

        <LiveClock />

        <div className="h-4 w-px bg-violet-500/20" />

        <div className="flex items-center gap-3">
          <div
            className="node-pill"
            style={{ borderColor: role_style.border, background: role_style.bg }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full live-pulse" style={{ background: role_style.dot, boxShadow: `0 0 8px ${role_style.dot}` }} />
            <span style={{ color: role_style.color }}>{role?.toUpperCase()} PORTAL</span>
          </div>
          <span className="text-sm font-medium text-foreground/90">{username}</span>
          <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-violet-500/10">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
