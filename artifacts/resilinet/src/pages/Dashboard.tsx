import React from 'react';
import { useAuth } from '../context/AuthContext';
import HospitalDashboard from './HospitalDashboard';
import AmbulanceDashboard from './AmbulanceDashboard';
import PoliceDashboard from './PoliceDashboard';

export default function Dashboard() {
  const { role } = useAuth();

  switch (role) {
    case 'hospital':
      return <HospitalDashboard />;
    case 'ambulance':
      return <AmbulanceDashboard />;
    case 'police':
      return <PoliceDashboard />;
    default:
      return <div>Invalid Role</div>;
  }
}
