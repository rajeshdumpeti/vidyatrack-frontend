import { useQuery } from "@tanstack/react-query";
import { getTeacherReadiness } from "@/api/teachers.api";

export function useTeacherReadiness() {
  const query = useQuery({
    queryKey: ["teacher", "me", "readiness"],
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
