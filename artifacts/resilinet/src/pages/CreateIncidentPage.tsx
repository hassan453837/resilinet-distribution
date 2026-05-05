import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useResiliNet } from '../context/ResiliNetContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { ArrowLeft, MapPin, AlertCircle, Crosshair } from 'lucide-react';
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { IncidentType, IncidentSeverity, NodeLocation } from '../lib/types';

type IncidentFormData = {
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  latitude: number | '';
  longitude: number | '';
  address: string;
};

const INCIDENT_TYPES: IncidentType[] = ['medical', 'fire', 'traffic', 'crime'];
const SEVERITIES: IncidentSeverity[] = ['critical', 'moderate', 'low'];
const DEFAULT_CENTER: [number, number] = [33.6844, 73.0479];

function CoordinatePicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    },
  });

  return null;
}

export default function CreateIncidentPage() {
  const [, setLocation] = useLocation();
  const { addIncident } = useResiliNet();
  
  const [formData, setFormData] = useState<IncidentFormData>({
    title: '',
    description: '',
    type: 'medical',
    severity: 'moderate',
    latitude: '',
    longitude: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const hasUnsavedChanges = useMemo(() => {
    return Boolean(
      formData.title.trim() ||
      formData.description.trim() ||
      formData.address.trim() ||
      formData.latitude !== '' ||
      formData.longitude !== '' ||
      formData.type !== 'medical' ||
      formData.severity !== 'moderate'
    );
  }, [formData]);

  const goToIncidents = () => {
    setLocation('/incidents');
  };

  const requestDiscard = () => {
    if (hasUnsavedChanges) {
      setDiscardOpen(true);
      return;
    }

    goToIncidents();
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.latitude === '' || isNaN(Number(formData.latitude))) newErrors.latitude = 'Valid latitude required';
    if (formData.longitude === '' || isNaN(Number(formData.longitude))) newErrors.longitude = 'Valid longitude required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createIncident = async () => {
    setIsSubmitting(true);

    try {
      const location: NodeLocation = {
        lat: Number(formData.latitude),
        lng: Number(formData.longitude),
        address: formData.address,
      };

      // Call the context function to add incident
      addIncident({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        severity: formData.severity,
        status: 'active',
        location,
      });

      setSuccess(true);
      setConfirmOpen(false);

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'medical',
        severity: 'moderate',
        latitude: '',
        longitude: '',
        address: '',
      });

      // Redirect after success
      setTimeout(() => {
        setLocation('/incidents');
      }, 1500);
    } catch (error) {
      console.error('Failed to create incident:', error);
      setErrors({ submit: 'Failed to create incident. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setConfirmOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMapPick = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    setErrors(prev => ({ ...prev, latitude: '', longitude: '' }));

    // Reverse geocode to get an address for the picked coordinates
    (async () => {
      try {
        setIsGeocoding(true);
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          { headers: { 'Accept': 'application/json' } }
        );
        if (!res.ok) throw new Error('Geocode failed');
        const data = await res.json();
        const address = data?.display_name || '';
        if (address) {
          setFormData(prev => ({ ...prev, address }));
          setErrors(prev => ({ ...prev, address: '' }));
        }
      } catch (err) {
        console.warn('Reverse geocode failed', err);
      } finally {
        setIsGeocoding(false);
      }
    })();
  };

  const selectedPosition = useMemo<[number, number] | null>(() => {
    if (formData.latitude === '' || formData.longitude === '') {
      return null;
    }
    return [Number(formData.latitude), Number(formData.longitude)];
  }, [formData.latitude, formData.longitude]);
  
  return (
    <div className="flex flex-col gap-6 overflow-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-card/30 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={requestDiscard}
          className="hover:bg-secondary"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Incident</h1>
          <p className="text-muted-foreground">Report an emergency quickly with structured, map-based location capture</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="p-4 flex items-center gap-2 text-green-500">
            <AlertCircle className="w-5 h-5" />
            <span>Incident created successfully! Redirecting...</span>
          </CardContent>
        </Card>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4 flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span>{errors.submit}</span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Form */}
        <Card className="glass-card border-primary/20 bg-card/40">
          <CardHeader className="border-b border-primary/10">
            <CardTitle>Incident Details</CardTitle>
            <CardDescription>Capture the core details and pin the exact location on the map</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Incident Title *</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Multi-vehicle collision on Kashmir Highway"
                    className={`bg-secondary/50 border-white/10 ${errors.title ? 'border-red-500' : ''}`}
                  />
                  {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide detailed information about the incident, visible hazards, and immediate response needs..."
                    rows={4}
                    className={`bg-secondary/50 border-white/10 ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Incident Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-secondary/50 border border-white/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {INCIDENT_TYPES.map(type => (
                      <option key={type} value={type} className="bg-secondary">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Severity *</label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-secondary/50 border border-white/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {SEVERITIES.map(severity => (
                      <option key={severity} value={severity} className="bg-secondary">
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-primary/15 bg-secondary/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <label className="text-sm font-medium">Location Details *</label>
                  </div>
                  <Badge variant="secondary" className="bg-primary/15 text-primary border border-primary/30">
                    Click Map To Pin
                  </Badge>
                </div>

                <div className="overflow-hidden rounded-md border border-white/10">
                  <div className="h-[280px] w-full">
                    <MapContainer
                      center={DEFAULT_CENTER}
                      zoom={12}
                      style={{ height: '100%', width: '100%', zIndex: 0 }}
                      zoomControl={true}
                    >
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                      />
                      <CoordinatePicker onPick={handleMapPick} />
                      {selectedPosition && (
                        <CircleMarker
                          center={selectedPosition}
                          radius={10}
                          pathOptions={{
                            color: '#22d3ee',
                            weight: 2,
                            fillColor: '#22d3ee',
                            fillOpacity: 0.35,
                          }}
                        />
                      )}
                    </MapContainer>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Crosshair className="w-3.5 h-3.5" />
                  Click anywhere on the map to set exact latitude and longitude automatically.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Latitude</label>
                    <Input
                      name="latitude"
                      type="number"
                      step="0.000001"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      readOnly
                      placeholder="Pick from map"
                      className={`bg-secondary/50 border-white/10 text-xs ${errors.latitude ? 'border-red-500' : ''}`}
                    />
                    {errors.latitude && <p className="text-xs text-red-500">{errors.latitude}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Longitude</label>
                    <Input
                      name="longitude"
                      type="number"
                      step="0.000001"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      readOnly
                      placeholder="Pick from map"
                      className={`bg-secondary/50 border-white/10 text-xs ${errors.longitude ? 'border-red-500' : ''}`}
                    />
                    {errors.longitude && <p className="text-xs text-red-500">{errors.longitude}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Address * {isGeocoding && <span className="text-[11px] text-muted-foreground">(finding address...)</span>}</label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g., Blue Area, Islamabad"
                    className={`bg-secondary/50 border-white/10 text-xs ${errors.address ? 'border-red-500' : ''}`}
                  />
                  {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={requestDiscard}
                  className="flex-1 border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? 'Creating...' : 'Create Incident'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card className="glass-card border-primary/20 bg-card/40 h-fit">
          <CardHeader>
            <CardTitle className="text-base">Incident Types & Severity</CardTitle>
            <CardDescription>Use these as quick guidance while reporting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium mb-2 text-muted-foreground">TYPES</p>
                <div className="flex flex-wrap gap-2">
                  {INCIDENT_TYPES.map(type => (
                    <Badge key={type} variant="secondary" className="bg-secondary/50">
                      {type.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium mb-2 text-muted-foreground">SEVERITY LEVELS</p>
                <div className="flex flex-wrap gap-2">
                  {SEVERITIES.map(severity => (
                    <Badge
                      key={severity}
                      className={
                        severity === 'critical'
                          ? 'bg-red-500/20 text-red-400'
                          : severity === 'moderate'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }
                    >
                      {severity.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="border border-primary/20 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm incident creation</AlertDialogTitle>
            <AlertDialogDescription>
              Review the incident details before submitting it to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Title:</span> {formData.title}</p>
            <p><span className="font-medium text-foreground">Type:</span> {formData.type}</p>
            <p><span className="font-medium text-foreground">Severity:</span> {formData.severity}</p>
            <p><span className="font-medium text-foreground">Location:</span> {formData.address}</p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void createIncident();
              }}
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? 'Creating...' : 'Confirm Create'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent className="border border-red-500/20 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard incident details?</AlertDialogTitle>
            <AlertDialogDescription>
              You have entered incident information. Going back will discard the current form data.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                setDiscardOpen(false);
                goToIncidents();
              }}
              disabled={isSubmitting}
              className="bg-red-500 text-white hover:bg-red-500/90"
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}