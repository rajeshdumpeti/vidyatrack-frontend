import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTeachingAssignment,
  getTeachingAssignmentsBySection,
} from "@/api/teachingAssignments.api";
import { queryKeys } from "@/constants/queryKeys";
import type { TeachingAssignmentCreatePayload } from "@/types/teachingAssignment.types";
import { useAuthStore } from "@/store/auth.store";

export function useTeachingAssignments(sectionId: number | null) {
  const { schoolId } = useAuthStore(); // Ensure school context is available

  const query = useQuery({
    queryKey: queryKeys.teachingAssignments(schoolId, sectionId),
    queryFn: () =>
      getTeachingAssignmentsBySection(schoolId!, sectionId as number),
    enabled: !!schoolId && typeof sectionId === "number" && sectionId > 0,
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
  const { schoolId } = useAuthStore();

  const mutation = useMutation({
    mutationFn: (payload: TeachingAssignmentCreatePayload) =>
      createTeachingAssignment({ ...payload, school_id: schoolId! }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: queryKeys.teachingAssignments(schoolId, variables.section_id),
      });
    },
  });

  return mutation;
}
