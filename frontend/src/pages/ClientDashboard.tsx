import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import type { Project } from '@/types/domain';

export function ClientDashboard() {
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects', 'mine'],
    queryFn: async () => {
      const res = await api.get('/projects?ownedBy=me');
      const payload = res.data as any;
      return Array.isArray(payload) ? payload : payload?.data ?? [];
    },
  });

  const summary = {
    total: projects.length,
    open: projects.filter(p => p.status === 'OPEN').length,
    active: projects.filter(p => p.status === 'IN_PROGRESS').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
  };

  if (isLoading) return <p>Loading projects...</p>;

  return (
    <div>
      <h1>My Projects</h1>

      <div className="summary-cards">
        <div>Total: {summary.total}</div>
        <div>Open: {summary.open}</div>
        <div>Active: {summary.active}</div>
        <div>Completed: {summary.completed}</div>
      </div>

      <Link to="/client/projects/new" className="btn">+ New Project</Link>

      {projects.length === 0 ? (
        <p>No projects yet — create your first one!</p>
      ) : (
        <div className="project-list">
          {projects.map(project => (
            <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
              <h3>{project.title}</h3>
              <span className={`badge ${project.status.toLowerCase()}`}>
                {project.status}
              </span>
              <p>Budget: ${project.budgetMin} – ${project.budgetMax}</p>
              <p>Deadline: {project.deadline}</p>
              {project.freelancerId ? (
                <p>Assigned to: {project.freelancerId.slice(0, 8)}…</p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
