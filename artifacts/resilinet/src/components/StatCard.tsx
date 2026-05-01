import React from 'react';
import { LucideIcon } from 'lucide-react';

type Accent = 'blue' | 'teal' | 'purple' | 'violet' | 'cyan' | 'red' | 'amber' | 'green' | 'pink' | 'primary' | 'destructive';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  accentColor?: Accent;
  trend?: string;
}

const accentMap: Record<Accent, { line: string; gradient: string; iconColor: string; ring: string }> = {
  blue:   { line: 'rgba(59, 130, 246, 0.9)',  gradient: 'stat-gradient-blue',   iconColor: '#60a5fa', ring: 'accent-hospital' },
  teal:   { line: 'rgba(20, 184, 166, 0.9)',  gradient: 'stat-gradient-teal',   iconColor: '#5eead4', ring: 'accent-ambulance' },
  purple: { line: 'rgba(139, 92, 246, 0.9)',  gradient: 'stat-gradient-violet', iconColor: '#c4b5fd', ring: 'accent-police' },
  violet: { line: 'rgba(139, 92, 246, 0.9)',  gradient: 'stat-gradient-violet', iconColor: '#c4b5fd', ring: 'accent-police' },
  cyan:   { line: 'rgba(34, 211, 238, 0.9)',  gradient: 'stat-gradient-cyan',   iconColor: '#67e8f9', ring: '' },
  red:    { line: 'rgba(239, 68, 68, 0.9)',   gradient: 'stat-gradient-pink',   iconColor: '#fca5a5', ring: 'accent-critical' },
  amber:  { line: 'rgba(245, 158, 11, 0.9)',  gradient: 'stat-gradient-cyan',   iconColor: '#fcd34d', ring: '' },
  green:  { line: 'rgba(34, 197, 94, 0.9)',   gradient: 'stat-gradient-teal',   iconColor: '#86efac', ring: '' },
  pink:   { line: 'rgba(236, 72, 153, 0.9)',  gradient: 'stat-gradient-pink',   iconColor: '#f0abfc', ring: '' },
  primary:     { line: 'rgba(139, 92, 246, 0.9)', gradient: 'stat-gradient-violet', iconColor: '#c4b5fd', ring: '' },
  destructive: { line: 'rgba(239, 68, 68, 0.9)',  gradient: 'stat-gradient-pink',   iconColor: '#fca5a5', ring: 'accent-critical' },
};

export function StatCard({ title, value, icon: Icon, description, accentColor = 'violet', trend }: StatCardProps) {
  const accent = accentMap[accentColor];
  return (
    <div
      className={`glass-card ${accent.ring} accent-line-top relative overflow-hidden p-5 group transition-all hover:-translate-y-0.5`}
      style={{ ['--line-color' as any]: accent.line }}
    >
      <div className="absolute -right-3 -top-3 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity">
        <Icon className="w-24 h-24" style={{ color: accent.iconColor }} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="label-muted">{title}</span>
        <Icon className="h-4 w-4" style={{ color: accent.iconColor, filter: `drop-shadow(0 0 6px ${accent.iconColor}80)` }} />
      </div>

      <div className={`stat-number ${accent.gradient}`}>{value}</div>

      {(description || trend) && (
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span className={`text-[11px] font-mono font-medium ${trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend}
            </span>
          )}
          {description && <span className="text-[11px] text-muted-foreground">{description}</span>}
        </div>
      )}
    </div>
  );
}
