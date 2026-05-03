import React from 'react';
import { useResiliNet } from '../context/ResiliNetContext';

export function NodeStatusBar() {
  const { nodes } = useResiliNet();

  const nodeAccent = (type: string) => {
    if (type === 'hospital') return { color: '#60a5fa', label: 'HOS' };
    if (type === 'ambulance') return { color: '#5eead4', label: 'AMB' };
    return { color: '#c4b5fd', label: 'POL' };
  };

  return (
    <div className="topbar-surface h-12 fixed top-16 w-full z-40 flex items-center px-6 border-t border-violet-500/10">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        {nodes.map((node) => {
          const a = nodeAccent(node.type);
          const isOnline = node.status === 'online';
          return (
            <div key={node.id} className="node-pill" style={{ borderColor: `${a.color}55` }}>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: isOnline ? '#22c55e' : '#ef4444', boxShadow: `0 0 8px ${isOnline ? '#22c55e' : '#ef4444'}` }}
              />
              <span style={{ color: a.color }}>{a.label}</span>
              <span className="text-muted-foreground/70">{node.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
