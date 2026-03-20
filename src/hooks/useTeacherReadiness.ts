import { useQuery } from "@tanstack/react-query";
import { getTeacherReadiness } from "@/api/teachers.api";
import { queryKeys } from "@/constants/queryKeys";

export function useTeacherReadiness() {
  const query = useQuery({
    queryKey: queryKeys.teacherReadiness(),
    queryFn: getTeacherReadiness,
    retry: 1,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
