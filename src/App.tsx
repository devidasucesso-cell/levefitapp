import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "@/contexts/UserContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Recipes from "./pages/Recipes";
import Detox from "./pages/Detox";
import Exercises from "./pages/Exercises";
import Progress from "./pages/Progress";
import CalendarPage from "./pages/CalendarPage";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import QRLogin from "./pages/QRLogin";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useUser();
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/qr-login" element={<QRLogin />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
      <Route path="/detox" element={<ProtectedRoute><Detox /></ProtectedRoute>} />
      <Route path="/exercises" element={<ProtectedRoute><Exercises /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
