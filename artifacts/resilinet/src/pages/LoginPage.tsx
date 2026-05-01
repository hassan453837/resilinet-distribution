import React, { useState } from 'react';
import { Shield, AlertTriangle, Activity, Radio, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== 'resilinet2026') {
      toast.error('Invalid password. Demo password is "resilinet2026"');
      return;
    }

    if (username.includes('@hospital') || username.includes('@ambulance') || username.includes('@police')) {
      login(username);
    } else {
      toast.error('Invalid portal credentials. Username must contain @hospital, @ambulance, or @police', {
        icon: <AlertTriangle className="h-4 w-4 text-destructive" />
      });
    }
  };

  const fillDemo = (role: 'hospital' | 'ambulance' | 'police') => {
    setUsername(`demo@${role}`);
    setPassword('resilinet2026');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Animated background orbs */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-60 pointer-events-none blur-[120px]"
        style={{
          background: 'radial-gradient(circle, hsla(265, 90%, 55%, 0.55), transparent 60%)',
          animation: 'orb-float 14s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full opacity-60 pointer-events-none blur-[140px]"
        style={{
          background: 'radial-gradient(circle, hsla(190, 95%, 50%, 0.45), transparent 60%)',
          animation: 'orb-float 18s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-50 pointer-events-none blur-[100px]"
        style={{
          background: 'radial-gradient(circle, hsla(320, 85%, 55%, 0.4), transparent 60%)',
          animation: 'orb-float 22s ease-in-out infinite',
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-overlay pointer-events-none" />

      {/* Top brand bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-xs font-mono text-muted-foreground z-20">
        <div className="flex items-center gap-2">
          <span className="live-dot-violet inline-block h-2 w-2 rounded-full" />
          <span className="tracking-widest">SYSTEM ONLINE</span>
        </div>
        <div className="tracking-widest">v2.4.0 // ISLAMABAD GRID</div>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md z-10 px-6">
        <div className="glass-card rounded-2xl p-10 relative overflow-hidden">
          {/* Inner shimmer line */}
          <div className="absolute inset-x-0 top-0 h-px shimmer-bar" />

          <div className="text-center space-y-3 mb-8">
            <div className="flex justify-center mb-2">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl flex items-center justify-center glow-ring-violet"
                  style={{ background: 'linear-gradient(135deg, hsla(265, 90%, 25%, 0.9), hsla(265, 90%, 15%, 0.9))' }}
                >
                  <Shield className="h-10 w-10 text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-500/40 via-fuchsia-500/30 to-cyan-500/40 blur-md -z-10" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight font-mono gradient-text">RESILINET</h1>
            <p className="text-muted-foreground text-[11px] uppercase tracking-[0.3em]">
              Distributed Emergency Command
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Portal ID</label>
                <Input
                  id="username"
                  placeholder="demo@hospital"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 text-base font-mono bg-black/30 border-violet-500/20 focus-visible:ring-violet-400/50 focus-visible:border-violet-400/50"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Access Key</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base font-mono bg-black/30 border-violet-500/20 focus-visible:ring-violet-400/50 focus-visible:border-violet-400/50"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-sm font-bold tracking-widest uppercase border-0 text-white"
              style={{
                background: 'linear-gradient(120deg, hsl(265, 90%, 60%) 0%, hsl(280, 90%, 65%) 50%, hsl(190, 95%, 55%) 100%)',
                boxShadow: '0 10px 40px -10px hsla(265, 90%, 50%, 0.6), 0 0 0 1px hsla(265, 90%, 70%, 0.3) inset',
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              Initialize Connection
            </Button>

            {/* Quick role pickers */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Quick Demo Access</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('hospital')}
                  className="group flex flex-col items-center gap-1.5 py-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/15 hover:border-cyan-400/50 transition-all"
                >
                  <Activity className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] uppercase tracking-wider text-cyan-300 font-mono">Hospital</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('ambulance')}
                  className="group flex flex-col items-center gap-1.5 py-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 hover:border-emerald-400/50 transition-all"
                >
                  <Radio className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-mono">Ambulance</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('police')}
                  className="group flex flex-col items-center gap-1.5 py-3 rounded-lg border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/15 hover:border-violet-400/50 transition-all"
                >
                  <Shield className="h-4 w-4 text-violet-300 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] uppercase tracking-wider text-violet-200 font-mono">Police</span>
                </button>
              </div>
              <p className="text-center text-[10px] font-mono text-muted-foreground/70">
                Pass: <span className="text-violet-300">resilinet2026</span>
              </p>
            </div>
          </form>
        </div>

        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 mt-6 font-mono">
          CS-347 // Parallel & Distributed Computing
        </p>
      </div>
    </div>
  );
}
