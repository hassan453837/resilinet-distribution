import React from 'react';
import { useResiliNet } from '../context/ResiliNetContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Activity, ShieldAlert, HeartPulse } from 'lucide-react';
import { StatCard } from '../components/StatCard';

export default function AnalyticsPage() {
  const { incidents, nodes } = useResiliNet();

  // Data processing
  const typeData = [
    { name: 'Medical', value: incidents.filter(i => i.type === 'medical').length, color: '#3b82f6' },
    { name: 'Fire', value: incidents.filter(i => i.type === 'fire').length, color: '#ef4444' },
    { name: 'Traffic', value: incidents.filter(i => i.type === 'traffic').length, color: '#f59e0b' },
    { name: 'Crime', value: incidents.filter(i => i.type === 'crime').length, color: '#8b5cf6' },
  ];

  const severityData = [
    { name: 'Critical', value: incidents.filter(i => i.severity === 'critical').length, color: '#ef4444' },
    { name: 'Moderate', value: incidents.filter(i => i.severity === 'moderate').length, color: '#f59e0b' },
    { name: 'Low', value: incidents.filter(i => i.severity === 'low').length, color: '#3b82f6' },
    { name: 'Resolved', value: incidents.filter(i => i.status === 'resolved').length, color: '#6b7280' },
  ];

  // Mock timeline data
  const timelineData = Array.from({ length: 24 }).map((_, i) => ({
    hour: `${i}:00`,
    incidents: Math.floor(Math.random() * 10) + 1,
    resolved: Math.floor(Math.random() * 8)
  }));

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Incidents" value={incidents.length} icon={Activity} accentColor="primary" />
        <StatCard title="Critical Active" value={incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length} icon={ShieldAlert} accentColor="destructive" />
        <StatCard title="Resolution Rate" value={`${Math.round((incidents.filter(i => i.status === 'resolved').length / incidents.length) * 100)}%`} icon={HeartPulse} accentColor="green" />
        <StatCard title="Active Nodes" value={nodes.filter(n => n.status === 'online').length} icon={Activity} accentColor="primary" description={`out of ${nodes.length}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incident Types Bar Chart */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Incidents by Type</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} />
                <YAxis stroke="#888" tick={{ fill: '#888' }} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Donut Chart */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Incidents by Severity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Timeline Area Chart */}
        <Card className="glass-card border-border/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Incident Volume (Last 24h)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="hour" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis stroke="#888" tick={{ fill: '#888' }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="incidents" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorIncidents)" name="New Incidents" />
                <Area type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
