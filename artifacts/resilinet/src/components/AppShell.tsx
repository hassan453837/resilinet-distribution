import React, { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { NodeStatusBar } from './NodeStatusBar';
import { Link, useLocation } from 'wouter';
import { Radio } from 'lucide-react';

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen text-foreground flex flex-col relative">
      {/* Subtle grid texture across the shell */}
      <div className="absolute inset-0 bg-grid-overlay pointer-events-none -z-10" />

      <TopBar />
      <NodeStatusBar />
      <div className="flex flex-1 pt-28">
        <Sidebar />
        <main className="flex-1 ml-[68px] p-5 overflow-auto">
          {children}
        </main>
      </div>
      {location !== '/communications' && (
        <Link
          href="/communications"
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-slate-950/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.14)] backdrop-blur-md hover:bg-slate-900"
        >
          <Radio className="h-4 w-4" />
          Open Comms
        </Link>
      )}
    </div>
  );
}
