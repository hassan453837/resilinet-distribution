import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { useResiliNet } from '../context/ResiliNetContext';
import { Node, Incident } from '../lib/types';

interface IslamabadMapProps {
  highlightRole?: 'hospital' | 'ambulance' | 'police' | null;
  className?: string;
  showHeatmap?: boolean;
}

const severityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return '#ef4444';
    case 'moderate': return '#f59e0b';
    case 'low': return '#3b82f6';
    case 'resolved': return '#6b7280';
    default: return '#6b7280';
  }
};

const nodeColor = (type: string) => type === 'hospital' ? '#3b82f6' : type === 'ambulance' ? '#14b8a6' : '#8b5cf6';

const nodeSvg = (type: string) => {
  if (type === 'hospital') return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
  if (type === 'ambulance') return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5M14 17h1M6 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>';
  return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
};

const createNodeIcon = (node: Node, highlight: boolean) => {
  const isOnline = node.status === 'online';
  const color = nodeColor(node.type);
  const statusColor = isOnline ? '#22c55e' : '#ef4444';
  const ringScale = highlight ? 'transform: scale(1.15);' : '';

  return L.divIcon({
    className: 'custom-node-marker',
    html: `
      <div class="marker-shell" style="--marker-color: ${color}; background: linear-gradient(135deg, ${color}, ${color}cc); box-shadow: 0 0 18px ${color}cc, 0 0 36px ${color}66; ${ringScale}">
        ${nodeSvg(node.type)}
        <span class="marker-status" style="background: ${statusColor}; color: ${statusColor};"></span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createIncidentIcon = (incident: Incident) => {
  const color = severityColor(incident.severity);
  const isCritical = incident.severity === 'critical';
  return L.divIcon({
    className: 'custom-incident-marker',
    html: `
      <div class="marker-shell" style="--marker-color: ${color}; width: 22px; height: 22px; background: ${color}; box-shadow: 0 0 ${isCritical ? '20px' : '12px'} ${color}cc, 0 0 ${isCritical ? '40px' : '24px'} ${color}55; border: 2px solid rgba(255,255,255,0.9);">
        <span style="width: 6px; height: 6px; border-radius: 999px; background: white;"></span>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

export default function IslamabadMap({ highlightRole, className, showHeatmap = false }: IslamabadMapProps) {
  const { nodes, incidents } = useResiliNet();

  return (
    <div className={`map-frame h-full w-full ${className ?? ''}`}>
      <MapContainer
        center={[33.6844, 73.0479]}
        zoom={12}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />

        {showHeatmap && incidents.filter(i => i.status !== 'resolved').map(incident => (
          <CircleMarker
            key={`heat-${incident.id}`}
            center={[incident.location.lat, incident.location.lng]}
            radius={28}
            pathOptions={{
              color: 'transparent',
              fillColor: severityColor(incident.severity),
              fillOpacity: incident.severity === 'critical' ? 0.28 : 0.14,
            }}
          />
        ))}

        {nodes.map(node => (
          <Marker
            key={node.id}
            position={[node.location.lat, node.location.lng]}
            icon={createNodeIcon(node, highlightRole === node.type)}
          >
            <Popup>
              <div className="space-y-1.5 min-w-[180px]">
                <div className="font-semibold text-sm border-b border-violet-500/30 pb-1.5 mb-1.5" style={{ color: nodeColor(node.type) }}>
                  {node.name}
                </div>
                <div className="text-[11px] flex items-center gap-2">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${node.status === 'online' ? 'live-dot-green' : 'live-dot-red'}`} />
                  <span className="uppercase tracking-wider font-mono">{node.status}</span>
                </div>
                <div className="text-[11px] text-muted-foreground truncate">{node.location.address}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {incidents.filter(i => i.status !== 'resolved').map(incident => (
          <Marker
            key={incident.id}
            position={[incident.location.lat, incident.location.lng]}
            icon={createIncidentIcon(incident)}
          >
            <Popup>
              <div className="space-y-1.5 min-w-[200px]">
                <div className="flex items-center justify-between border-b border-violet-500/30 pb-1.5 mb-1.5">
                  <span className="font-mono text-[11px] text-muted-foreground">{incident.id}</span>
                  <span className={`severity-pill ${incident.severity}`}>{incident.severity}</span>
                </div>
                <div className="text-sm font-medium">{incident.title}</div>
                <div className="text-[11px] text-muted-foreground">{incident.description}</div>
                <div className="text-[10px] pt-1.5 border-t border-violet-500/20 mt-1.5 font-mono uppercase tracking-wider">
                  Status: <span className="text-violet-300">{incident.status}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
