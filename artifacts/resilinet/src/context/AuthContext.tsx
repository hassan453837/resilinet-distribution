import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role } from '../lib/types';
import { useLocation } from 'wouter';

interface AuthState {
  username: string | null;
  role: Role;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem('resilinet_auth');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse auth from localStorage', e);
    }
    return { username: null, role: null, isAuthenticated: false };
  });

  const [, setLocation] = useLocation();

  useEffect(() => {
    localStorage.setItem('resilinet_auth', JSON.stringify(state));
  }, [state]);

  const login = (username: string) => {
    let role: Role = null;
    
    if (username.includes('@hospital')) {
      role = 'hospital';
    } else if (username.includes('@ambulance')) {
      role = 'ambulance';
    } else if (username.includes('@police')) {
      role = 'police';
    }

    if (role) {
      setState({ username, role, isAuthenticated: true });
      setLocation('/dashboard');
    }
  };

  const logout = () => {
    setState({ username: null, role: null, isAuthenticated: false });
    setLocation('/login');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
