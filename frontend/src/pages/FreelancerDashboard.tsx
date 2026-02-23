import { useAuth } from '../contexts/AuthContext';

export function FreelancerDashboard(): React.ReactNode {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Freelancer Dashboard</h1>
        <button type="button" onClick={logout}>
          Sign Out
        </button>
      </header>
      <p>
        Welcome, {user?.firstName} {user?.lastName}
      </p>
    </div>
  );
}
