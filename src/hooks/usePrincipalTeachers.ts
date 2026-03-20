import { useQuery } from "@tanstack/react-query";
import { listTeachers } from "@/api/teachers.api";
import { queryKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/store/auth.store";

export function usePrincipalTeachers() {
  const schoolId = useAuthStore((s) => s.schoolId);

  const q = useQuery({
    queryKey: queryKeys.principalTeachers(schoolId),
    queryFn: () => listTeachers(schoolId!),
    enabled: !!schoolId,
    retry: 1,
  });

  return {
    data: q.data ?? [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
