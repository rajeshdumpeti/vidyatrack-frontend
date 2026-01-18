import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTeachingAssignment,
  getTeachingAssignmentsBySection,
} from "@/api/teachingAssignments.api";
import type { TeachingAssignmentCreatePayload } from "@/types/teachingAssignment.types";

export function useTeachingAssignments(sectionId: number | null) {
  const query = useQuery({
    queryKey: ["teaching-assignments", { sectionId }],
    queryFn: () => getTeachingAssignmentsBySection(sectionId as number),
    enabled: typeof sectionId === "number" && sectionId > 0,
    retry: 1,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateTeachingAssignment() {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: TeachingAssignmentCreatePayload) =>
      createTeachingAssignment(payload),
    onSuccess: (_data, variables) => {
      // Safe: refetch the section's assignments after a successful create
      qc.invalidateQueries({
        queryKey: ["teaching-assignments", { sectionId: variables.section_id }],
      });
    },
  });

  return mutation;
}
