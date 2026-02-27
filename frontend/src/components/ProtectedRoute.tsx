import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from './LoadingScreen';

/**
 * Wraps routes that require an authenticated session AND a loaded user profile.
 * Redirects to /login if either is missing.
 * Shows a loading screen while the initial auth check is in progress.
 */
export function ProtectedRoute(): React.ReactNode {
  const { user, session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
