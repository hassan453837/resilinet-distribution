import React from 'react';
import { useAuth } from '../context/AuthContext';
import HospitalDashboard from './HospitalDashboard';
import AmbulanceDashboard from './AmbulanceDashboard';
import PoliceDashboard from './PoliceDashboard';

export default function Dashboard() {
  const { role, user, isLoading } = useAuth();

  console.log('DASHBOARD_CHECK:', { role, user, isLoading });

  if (isLoading) {
    return <div className="p-20 text-white">Auth Context is still loading...</div>;
  }

  switch (role) {
    case 'hospital':
      return <HospitalDashboard />;
    case 'ambulance':
      return <AmbulanceDashboard />;
    case 'police':
      return <PoliceDashboard />;
    default:
      return (
        <div className="p-20 text-white bg-red-900/20 border border-red-500 rounded">
          <h2 className="text-xl font-bold">Invalid or Missing Role</h2>
          <p>Current Role: {role || 'null/undefined'}</p>
          <p>User ID: {user?.id || 'No user found'}</p>
        </div>
      );
  }
}
