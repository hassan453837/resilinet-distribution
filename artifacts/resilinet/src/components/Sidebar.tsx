import React from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Map as MapIcon,
  AlertOctagon,
  Activity,
  BarChart3,
  ScrollText,
  Cpu,
} from 'lucide-react';

export function Sidebar() {
  const [location] = useLocation();
  const { role } = useAuth();

  const accentColor = role === 'hospital' ? '#60a5fa'
    : role === 'ambulance' ? '#5eead4'
    : '#c4b5fd';
  const accentRgba = role === 'hospital' ? '37, 99, 235'
    : role === 'ambulance' ? '20, 184, 166'
    : '139, 92, 246';
  const hoverGlowClass = role === 'hospital' ? 'sidebar-icon-glow-hospital'
    : role === 'ambulance' ? 'sidebar-icon-glow-ambulance'
    : 'sidebar-icon-glow-police';

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/map', icon: MapIcon, label: 'Live Map' },
    { href: '/incidents', icon: AlertOctagon, label: 'Incidents' },
    { href: `/${role}`, icon: Activity, label: `${role?.charAt(0).toUpperCase()}${role?.slice(1)} Portal` },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/events', icon: ScrollText, label: 'Event Log' },
    { href: '/concepts', icon: Cpu, label: 'PDC Concepts' },
  ];

  return (
    <aside className="sidebar-surface w-[68px] hover:w-[230px] transition-all duration-300 ease-in-out fixed left-0 top-16 bottom-0 z-40 flex flex-col group overflow-hidden">
      <nav className="flex-1 py-6 flex flex-col gap-1.5 px-2.5">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className="relative flex items-center gap-3.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
                style={
                  isActive
                    ? {
                        background: `linear-gradient(135deg, rgba(${accentRgba}, 0.18), rgba(${accentRgba}, 0.06))`,
                        border: `1px solid rgba(${accentRgba}, 0.4)`,
                        boxShadow: `0 0 16px rgba(${accentRgba}, 0.18) inset`,
                      }
                    : { border: '1px solid transparent' }
                }
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                    style={{ background: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
                  />
                )}
                <item.icon
                  className={`h-[18px] w-[18px] shrink-0 transition-all ${hoverGlowClass}`}
                  style={{ color: isActive ? accentColor : 'rgba(180, 180, 200, 0.7)' }}
                />
                <span
                  className="text-[13px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: isActive ? '#f5f5f7' : 'rgba(180, 180, 200, 0.85)' }}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-violet-500/15">
        <div className="flex items-center gap-2 justify-center group-hover:justify-start">
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full live-pulse" style={{ background: '#3b82f6', boxShadow: '0 0 6px #3b82f6' }} />
            <span className="h-1.5 w-1.5 rounded-full live-pulse" style={{ background: '#14b8a6', boxShadow: '0 0 6px #14b8a6' }} />
            <span className="h-1.5 w-1.5 rounded-full live-pulse" style={{ background: '#8b5cf6', boxShadow: '0 0 6px #8b5cf6' }} />
          </div>
          <span className="text-[10px] uppercase font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity tracking-widest">
            Cluster Sync
          </span>
        </div>
      </div>
    </aside>
  );
}
