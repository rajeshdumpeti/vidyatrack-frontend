import { useQuery } from "@tanstack/react-query";
import { listTeachers } from "@/api/teachers.api";
import { useAuthStore } from "@/store/auth.store";

export function usePrincipalTeachers() {
  const schoolId = useAuthStore((s) => s.schoolId);

  const q = useQuery({
    queryKey: ["principal-teachers", schoolId],
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
