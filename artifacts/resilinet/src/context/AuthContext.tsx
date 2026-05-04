import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role } from '../lib/types';
import { socket } from '../lib/socket';
import { useLocation } from 'wouter';

interface AuthUser {
  email: string;
  role: Role;
  organization_name?: string;
  id?: string;
  node_id?: string;
}

interface AuthState {
  user: AuthUser | null;
  username: string | null;
  role: Role;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem('resilinet_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user && parsed?.isAuthenticated) {
          return parsed;
        }
        if (parsed?.username || parsed?.role) {
          return {
            user: parsed.username
              ? { email: parsed.username, role: parsed.role ?? null, organization_name: parsed.username }
              : null,
            username: parsed.username ?? null,
            role: parsed.role ?? null,
            isAuthenticated: Boolean(parsed.isAuthenticated)
          };
        }
      }
    } catch (e) {
      console.error('Failed to parse auth from localStorage', e);
    }
    return { user: null, username: null, role: null, isAuthenticated: false };
  });
  const [isLoading, setIsLoading] = useState(true);

  const [, setLocation] = useLocation();

  useEffect(() => {
    localStorage.setItem('resilinet_auth', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if ((window as any)._heartbeatInterval) {
        clearInterval((window as any)._heartbeatInterval);
      }
    };
  }, []);

  const login = (user: AuthUser) => {
    const username = user.organization_name || user.email;
    setState({ user, username, role: user.role, isAuthenticated: true });
    if (user.node_id) {
      socket.emit('register-node', { nodeId: user.node_id });
      // Send heartbeat immediately
      socket.emit('heartbeat', { nodeId: user.node_id });
      // Keep sending heartbeat every 3 seconds to stay online
      const heartbeatInterval = setInterval(() => {
        socket.emit('heartbeat', { nodeId: user.node_id });
      }, 3000);
      // Store interval ID to clear on logout
      (window as any)._heartbeatInterval = heartbeatInterval;
    }
    setLocation('/dashboard');
  };

  const logout = () => {
    // Stop heartbeat interval
    if ((window as any)._heartbeatInterval) {
      clearInterval((window as any)._heartbeatInterval);
      delete (window as any)._heartbeatInterval;
    }
    const nodeId = state.user?.node_id;

    if (nodeId) {
      socket.emit('node-offline', { nodeId });
      fetch('http://localhost:3001/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id: nodeId })
      }).catch((err) => {
        console.error('Logout request failed:', err);
      });
    }

    setState({ user: null, username: null, role: null, isAuthenticated: false });
    setLocation('/login');
  };

  return (
    <AuthContext.Provider value={{ ...state, isLoading, login, logout }}>
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
