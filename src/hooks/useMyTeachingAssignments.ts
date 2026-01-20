import { useQuery } from "@tanstack/react-query";
import { getMyTeachingAssignments } from "@/api/teachers.api";
import type { TeachingAssignmentMeDto } from "@/types/teachingAssignment.types";

export function useMyTeachingAssignments() {
  const query = useQuery({
    queryKey: ["teacher", "me", "teaching-assignments"],
    queryFn: getMyTeachingAssignments,
    retry: 1,
  });

  return {
    data: query.data as TeachingAssignmentMeDto[] | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
