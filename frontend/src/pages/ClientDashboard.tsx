import { useAuth } from '../contexts/AuthContext';

export function ClientDashboard(): React.ReactNode {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <p className="text-muted-foreground">
        Welcome back, {user?.firstName} {user?.lastName}.
      </p>
    </div>
  );
}
