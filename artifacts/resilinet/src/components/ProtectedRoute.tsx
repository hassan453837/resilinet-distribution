import React, { ReactNode, useState, useEffect } from 'react';
import { useLocation, Redirect } from 'wouter';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();
  const [isReady, setIsReady] = useState(false);

  // Give the Auth state a moment to "settle" on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100); // 100ms is usually enough to catch the Supabase session
    return () => clearTimeout(timer);
  }, []);

  // 1. Wait for the 'Ready' flag
  if (!isReady) {
    return null; // Or a loading spinner
  }

  // 2. If we are ready and still not authenticated, bounce to login
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting...");
    return <Redirect to="/login" />;
  }

  // 3. Handle root redirect
  if (location === '/' || location === '') {
    return <Redirect to="/dashboard" />;
  }

  // 4. Everything is good!
  return <>{children}</>;
}