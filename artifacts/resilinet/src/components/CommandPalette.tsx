import React, { useState, useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useLocation } from 'wouter';
import { useResiliNet } from '../context/ResiliNetContext';
import { Map, LayoutDashboard, ShieldAlert, Activity, BarChart3, ScrollText } from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { incidents, nodes } = useResiliNet();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => setLocation('/dashboard'))}>
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation('/map'))}>
            <Map className="mr-2 h-4 w-4" /> Live Map
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation('/incidents'))}>
            <ShieldAlert className="mr-2 h-4 w-4" /> Incidents
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation('/analytics'))}>
            <BarChart3 className="mr-2 h-4 w-4" /> Analytics
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation('/events'))}>
            <ScrollText className="mr-2 h-4 w-4" /> Event Log
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Active Nodes">
          {nodes.map(node => (
            <CommandItem key={node.id} onSelect={() => runCommand(() => setLocation(`/${node.type}`))}>
              <Activity className={`mr-2 h-4 w-4 ${node.status === 'online' ? 'text-green-500' : 'text-red-500'}`} />
              {node.name} ({node.id})
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Recent Incidents">
          {incidents.slice(0, 5).map(inc => (
            <CommandItem key={inc.id} onSelect={() => runCommand(() => setLocation('/incidents'))}>
              <div className={`mr-2 h-2 w-2 rounded-full ${inc.severity === 'critical' ? 'bg-red-500' : 'bg-primary'}`} />
              {inc.id}: {inc.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
