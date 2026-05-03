import React from 'react';
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import NotFound from "./pages/not-found";

import { AuthProvider } from "./context/AuthContext";
import { ResiliNetProvider } from "./context/ResiliNetContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import { CommandPalette } from "./components/CommandPalette";

import { Redirect } from "wouter";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Redirect to={isAuthenticated ? "/dashboard" : "/login"} />;
}
import MapPage from "./pages/MapPage";
import IncidentsPage from "./pages/IncidentsPage";
import HospitalPortal from "./pages/HospitalPortal";
import AmbulancePortal from "./pages/AmbulancePortal";
import PolicePortal from "./pages/PolicePortal";
import AnalyticsPage from "./pages/AnalyticsPage";
import EventLogPage from "./pages/EventLogPage";
import ConceptsPage from "./pages/ConceptsPage";

const queryClient = new QueryClient();

function AppContent() {
  return (
    <>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/" component={RootRedirect} />

        <Route path="/:rest*">
          <ProtectedRoute>
            <AppShell>
              <Switch>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/map" component={MapPage} />
                <Route path="/incidents" component={IncidentsPage} />
                <Route path="/hospital" component={HospitalPortal} />
                <Route path="/ambulance" component={AmbulancePortal} />
                <Route path="/police" component={PolicePortal} />
                <Route path="/analytics" component={AnalyticsPage} />
                <Route path="/events" component={EventLogPage} />
                <Route path="/concepts" component={ConceptsPage} />
                <Route component={NotFound} />
              </Switch>
            </AppShell>
          </ProtectedRoute>
        </Route>
      </Switch>
      <CommandPalette />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
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
