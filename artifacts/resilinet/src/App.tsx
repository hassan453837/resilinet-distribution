import React from 'react';
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip";

// Context & Auth
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ResiliNetProvider } from "./context/ResiliNetContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import { CommandPalette } from "./components/CommandPalette";

// Pages
import NotFound from "./pages/not-found";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import IncidentsPage from "./pages/IncidentsPage";
import CreateIncidentPage from "./pages/CreateIncidentPage";
import HospitalPortal from "./pages/HospitalPortal";
import AmbulancePortal from "./pages/AmbulancePortal";
import PolicePortal from "./pages/PolicePortal";
import AnalyticsPage from "./pages/AnalyticsPage";
import EventLogPage from "./pages/EventLogPage";
import ConceptsPage from "./pages/ConceptsPage";

const queryClient = new QueryClient();

/**
 * Helper component to wrap protected pages in the layout
 */
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppShell>{children}</AppShell>
  </ProtectedRoute>
);

/**
 * Handles the root "/" logic
 */
function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Redirect to={isAuthenticated ? "/dashboard" : "/login"} />;
}

function AppContent() {
  return (
    <>
      <Switch>
        {/* 1. PUBLIC ROUTES */}
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/" component={RootRedirect} />

        {/* 2. PROTECTED ROUTES (Flattened for stability) */}
        
        {/* IMPORTANT: Specific sub-routes must come BEFORE their parents */}
        <Route path="/incidents/create">
          <ProtectedLayout><CreateIncidentPage /></ProtectedLayout>
        </Route>

        <Route path="/incidents">
          <ProtectedLayout><IncidentsPage /></ProtectedLayout>
        </Route>

        <Route path="/dashboard">
          <ProtectedLayout><Dashboard /></ProtectedLayout>
        </Route>

        <Route path="/map">
          <ProtectedLayout><MapPage /></ProtectedLayout>
        </Route>

        <Route path="/hospital">
          <ProtectedLayout><HospitalPortal /></ProtectedLayout>
        </Route>

        <Route path="/ambulance">
          <ProtectedLayout><AmbulancePortal /></ProtectedLayout>
        </Route>

        <Route path="/police">
          <ProtectedLayout><PolicePortal /></ProtectedLayout>
        </Route>

        <Route path="/analytics">
          <ProtectedLayout><AnalyticsPage /></ProtectedLayout>
        </Route>

        <Route path="/events">
          <ProtectedLayout><EventLogPage /></ProtectedLayout>
        </Route>

        <Route path="/concepts">
          <ProtectedLayout><ConceptsPage /></ProtectedLayout>
        </Route>

        {/* 3. FALLBACK */}
        <Route component={NotFound} />
      </Switch>
      <CommandPalette />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <AuthProvider>
            <ResiliNetProvider>
              <AppContent />
              <Toaster theme="dark" position="bottom-right" richColors />
            </ResiliNetProvider>
          </AuthProvider>
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;