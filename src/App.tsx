import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Recipes from "./pages/Recipes";
import Detox from "./pages/Detox";
import Exercises from "./pages/Exercises";
import Progress from "./pages/Progress";
import CalendarPage from "./pages/CalendarPage";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import PendingApproval from "./pages/PendingApproval";
import CodeVerification from "./pages/CodeVerification";
import ResetPassword from "./pages/ResetPassword";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import KitSelectionPage from "./pages/KitSelectionPage";
import Referral from "./pages/Referral";
import JourneyPopup from "@/components/JourneyPopup";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading, isCodeValidated, isAdmin, profile } = useAuth();
  
  // Wait for both auth and profile to load
  if (isLoading || (isLoggedIn && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  // Code must be validated (unless admin)
  if (!isAdmin && !isCodeValidated) {
    return <Navigate to="/code-verification" replace />;
  }

  // New users without kit_type must select a kit first
  if (!isAdmin && !profile?.kit_type) {
    return <Navigate to="/kit-selection" replace />;
  }

  return (
    <>
      {children}
      <JourneyPopup />
    </>
  );
};

const KitSelectionRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading, isCodeValidated, isAdmin, profile } = useAuth();
  
  // Wait for both auth and profile to load
  if (isLoading || (isLoggedIn && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  // Code must be validated first (unless admin)
  if (!isAdmin && !isCodeValidated) {
    return <Navigate to="/code-verification" replace />;
  }

  // If kit already selected, go to dashboard
  if (profile?.kit_type) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const CodeVerificationRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading, isCodeValidated, isAdmin, profile } = useAuth();
  
  // Wait for both auth and profile to load
  if (isLoading || (isLoggedIn && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  // If code already validated or is admin, go to dashboard (kit selection handles its own redirect)
  if (isCodeValidated || isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// ApprovalRoute removed - approval no longer required

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/install" element={<Install />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/code-verification" element={<CodeVerificationRoute><CodeVerification /></CodeVerificationRoute>} />
      <Route path="/kit-selection" element={<KitSelectionRoute><KitSelectionPage /></KitSelectionRoute>} />
      <Route path="/pending-approval" element={<Navigate to="/dashboard" replace />} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
      <Route path="/detox" element={<ProtectedRoute><Detox /></ProtectedRoute>} />
      <Route path="/exercises" element={<ProtectedRoute><Exercises /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/referral" element={<ProtectedRoute><Referral /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
          <PWAInstallPrompt />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
