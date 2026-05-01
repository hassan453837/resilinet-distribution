import React, { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-foreground flex flex-col relative">
      {/* Subtle grid texture across the shell */}
      <div className="absolute inset-0 bg-grid-overlay pointer-events-none -z-10" />

      <TopBar />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className="flex-1 ml-[68px] p-5 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
