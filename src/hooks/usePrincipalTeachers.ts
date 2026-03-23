import { useQuery } from "@tanstack/react-query";
import { listTeachers } from "@/api/teachers.api";
import { queryKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/store/auth.store";

export function usePrincipalTeachers() {
  const schoolId = useAuthStore((s) => s.schoolId);

  const q = useQuery({
    queryKey: queryKeys.principalTeachers(schoolId),
    queryFn: () => listTeachers(schoolId!, { page: 1, limit: 200 }),
    enabled: !!schoolId,
    retry: 1,
  });

  return {
    data: q.data?.data ?? [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
