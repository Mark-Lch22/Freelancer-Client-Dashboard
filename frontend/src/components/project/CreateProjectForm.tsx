import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import type { CreateProjectDTO } from '@/types/domain';

export default function CreateProjectForm(): React.ReactElement {
  const navigate = useNavigate();
  const [form, setForm] = useState<{
    title: string;
    description: string;
    budgetMin: number | '';
    budgetMax: number | '';
    deadline: string;
    projectType: 'FIXED' | 'HOURLY';
    skills: string;
  }>({
    title: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
    projectType: 'FIXED',
    skills: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === 'number') {
      const num = value === '' ? '' : Number(value);
      setForm((prev) => ({ ...prev, [name]: num } as any));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value } as any));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: CreateProjectDTO = {
        title: form.title,
        description: form.description,
        budgetMin: Number(form.budgetMin) || 0,
        budgetMax: Number(form.budgetMax) || 0,
        deadline: form.deadline,
        projectType: form.projectType,
        requiredSkills: form.skills ? form.skills.split(',').map((s) => s.trim()) : [],
      };

      const res = await api.post('/projects', payload);
      const projectId = res.data?.id as string;
      await api.patch(`/projects/${projectId}/status`, { status: 'OPEN' });
      navigate(`/projects/${projectId}`);
    } catch (err) {
      setError('Failed to create project');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New Project</h2>

      <input name="title" placeholder="Title" required value={form.title} onChange={handleChange} />
      <textarea name="description" placeholder="Description" required value={form.description} onChange={handleChange} />
      <input
        name="budgetMin"
        type="number"
        placeholder="Budget Min"
        value={form.budgetMin === '' ? '' : String(form.budgetMin)}
        onChange={handleChange}
      />
      <input
        name="budgetMax"
        type="number"
        placeholder="Budget Max"
        value={form.budgetMax === '' ? '' : String(form.budgetMax)}
        onChange={handleChange}
      />
      <input name="deadline" type="date" value={form.deadline} onChange={handleChange} />
      <select name="projectType" value={form.projectType} onChange={handleChange}>
        <option value="FIXED">Fixed</option>
        <option value="HOURLY">Hourly</option>
      </select>
      <input name="skills" placeholder="Required Skills (comma-separated)" value={form.skills} onChange={handleChange} />

      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  );
}
