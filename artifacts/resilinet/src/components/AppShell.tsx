import React, { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { NodeStatusBar } from './NodeStatusBar';

export function AppShell({ children }: { children: ReactNode }) {
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
    </div>
  );
}
