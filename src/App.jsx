import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import SOPLibrary from '@/pages/SOPLibrary';
import SOPDetail from '@/pages/SOPDetail';
import Documents from '@/pages/Documents';
import Onboarding from '@/pages/Onboarding';
import ClientDelivery from '@/pages/ClientDelivery';
import ProjectDetail from '@/pages/ProjectDetail';
import ProjectOverview from '@/pages/ProjectOverview';
import ClientDirectory from '@/pages/ClientDirectory';
import ClientDetail from '@/pages/ClientDetail';
import Contractors from '@/pages/Contractors';
import ContractorDetail from '@/pages/ContractorDetail';
import Profile from '@/pages/Profile';
import ToolsDirectory from '@/pages/ToolsDirectory';
import TrainingCenter from '@/pages/TrainingCenter';
import Announcements from '@/pages/Announcements';
import AdminPanel from '@/pages/admin/AdminPanel';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-sky-200 border-t-[#1a3676] rounded-full animate-spin"></div>
          <span className="text-sm text-muted-foreground font-medium">Loading Agency OS…</span>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered' || authError.type === 'domain_restricted' || authError.type === 'pending_approval') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sops" element={<SOPLibrary />} />
          <Route path="/sops/:id" element={<SOPDetail />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/client-delivery" element={<ClientDelivery />} />
          <Route path="/projectoverview" element={<ProjectOverview />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/clients" element={<ClientDirectory />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/contractors" element={<Contractors />} />
          <Route path="/contractors/:id" element={<ContractorDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tools" element={<ToolsDirectory />} />
          <Route path="/training" element={<TrainingCenter />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App