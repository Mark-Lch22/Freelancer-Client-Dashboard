import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/services/api';
import type { Milestone, CreateMilestoneDTO } from '@/types/domain';
import { getMilestones } from '@/services/milestonesApi';

export function useMilestones(projectId: string) {
  return useQuery<Milestone[]>({
    queryKey: ['milestones', projectId],
    queryFn: () => getMilestones(projectId),
    enabled: !!projectId,
  });
}

export function useCreateMilestone(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<Milestone, Error, CreateMilestoneDTO>({
    mutationFn: async (dto) => (await httpClient.post<Milestone>(`/projects/${projectId}/milestones`, dto)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
    },
  });
}
