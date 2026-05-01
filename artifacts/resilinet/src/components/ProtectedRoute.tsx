import React, { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
    if (location === '/' || location === '') {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, location, setLocation]);

  if (!isAuthenticated) return null;
  if (location === '/' || location === '') return null;

  return <>{children}</>;
}
