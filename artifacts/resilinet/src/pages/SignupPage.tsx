import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Link, useLocation } from 'wouter';

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const [nodeId, setNodeId] = useState('');
  const [nodes, setNodes] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [nodesLoading, setNodesLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('hospital');

  useEffect(() => {
    let isMounted = true;

    const fetchNodes = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/nodes');
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || 'Unable to load nodes.');
        }
        if (isMounted) {
          setNodes(Array.isArray(payload?.nodes) ? payload.nodes : []);
        }
      } catch (err) {
        console.error('Failed to load nodes:', err);
        if (isMounted) {
          toast.error('Unable to load nodes. Please try again.', {
            icon: <AlertTriangle className="h-4 w-4 text-destructive" />
          });
        }
      } finally {
        if (isMounted) {
          setNodesLoading(false);
        }
      }
    };

    fetchNodes();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nodeId || !email || !password || !role) {
      toast.error('All fields are required.', {
        icon: <AlertTriangle className="h-4 w-4 text-destructive" />
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_id: nodeId,
          email,
          password,
          role
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload?.error || 'Unable to create account.', {
          icon: <AlertTriangle className="h-4 w-4 text-destructive" />
        });
        return;
      }

      toast.success('Account created. Please log in.');
      setLocation('/login');
    } catch (err) {
      console.error('Signup request failed:', err);
      toast.error('Unable to reach the server. Please try again.', {
        icon: <AlertTriangle className="h-4 w-4 text-destructive" />
      });
    }
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
              Node Onboarding Portal
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-3">
              <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Organization</label>
                  <select
                    id="nodeId"
                    value={nodeId}
                    onChange={(e) => setNodeId(e.target.value)}
                    className="h-12 w-full rounded-md px-3 text-base font-mono bg-black/30 border border-violet-500/20 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:border-violet-400/50"
                    disabled={nodesLoading || nodes.length === 0}
                  >
                    <option value="">{nodesLoading ? 'Loading nodes...' : 'Select a node'}</option>
                    {nodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.name} · {node.type}
                      </option>
                    ))}
                  </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Email</label>
                <Input
                  id="email"
                  placeholder="ops@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-12 w-full rounded-md px-3 text-base font-mono bg-black/30 border border-violet-500/20 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:border-violet-400/50"
                >
                  <option value="hospital">Hospital</option>
                  <option value="police">Police</option>
                  <option value="ambulance">Ambulance</option>
                </select>
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
              Create Node Access
            </Button>

            <div className="pt-4 border-t border-white/5 space-y-3">
              <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Already registered</p>
              <p className="text-center text-[10px] font-mono text-muted-foreground/70">
                <Link href="/login" className="text-violet-300 hover:text-violet-200">Return to login</Link>
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
