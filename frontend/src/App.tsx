import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ClientDashboard } from './pages/ClientDashboard';
import { FreelancerDashboard } from './pages/FreelancerDashboard';
import { UserRole } from './types/auth';

function RootRedirect(): React.ReactNode {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return user.role === UserRole.CLIENT
    ? <Navigate to="/client/dashboard" replace />
    : <Navigate to="/freelancer/dashboard" replace />;
}

export default function App(): React.ReactNode {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes — require authentication */}
          <Route element={<ProtectedRoute />}>
            {/* Client routes */}
            <Route element={<RoleRoute allowedRole={UserRole.CLIENT} />}>
              <Route path="/client/dashboard" element={<ClientDashboard />} />
            </Route>

            {/* Freelancer routes */}
            <Route element={<RoleRoute allowedRole={UserRole.FREELANCER} />}>
              <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
            </Route>
          </Route>

          {/* Root — redirect based on role */}
          <Route path="/" element={<RootRedirect />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
