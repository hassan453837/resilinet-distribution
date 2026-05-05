import React from 'react';
import { ChatBox } from '../components/ChatBox';
import { Radio } from 'lucide-react';

export default function CommunicationsPage() {
  return (
    <div className="flex min-h-full flex-col gap-4 pb-6">
      <div className="glass-card border-cyan-400/20 bg-card/40 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-cyan-200">
              <Radio className="h-3.5 w-3.5" /> Tactical Communications
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Command Center Messaging</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Broadcast alerts to every active node or send a unicast message to one targeted node. Messages are ordered from the database timestamp so every client sees the same sequence.
            </p>
          </div>
          <div className="max-w-sm rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-muted-foreground">
            <p className="mb-1 font-semibold text-white/90">Delivery Modes</p>
            <p>Broadcast uses <span className="text-cyan-200">recipient_id = null</span>.</p>
            <p>Unicast uses a selected target node ID.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_288px] xl:items-start">
        <div className="h-[42rem] min-h-[32rem]">
          <ChatBox variant="page" />
        </div>

        <div className="space-y-3 overflow-visible xl:overflow-hidden">
          <div className="glass-card border-cyan-400/20 bg-card/40 p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">Usage Notes</h2>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>• Click Broadcast to reach all subscribed nodes.</li>
              <li>• Switch to Unicast to pick a specific node.</li>
              <li>• The message stream only renders messages visible to your node.</li>
              <li>• The chat listens in real time and stays non-blocking for the rest of the dashboard.</li>
            </ul>
          </div>

          <div className="glass-card border-cyan-400/20 bg-card/40 p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">Demo Checklist</h2>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>• Use two browsers to test broadcast fan-out.</li>
              <li>• Send one unicast to verify recipient filtering.</li>
              <li>• Watch timestamps stay consistent across clients.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}