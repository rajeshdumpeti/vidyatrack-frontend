import { useQuery } from "@tanstack/react-query";
import { listTeachers } from "@/api/teachers.api";
import { useAuthStore } from "@/store/auth.store";

export function useTeachers() {
  const { schoolId } = useAuthStore();

  const q = useQuery({
    queryKey: ["teachers", schoolId], // Multi-tenant query key
    queryFn: () => listTeachers(schoolId!),
    enabled: !!schoolId, // Don't fetch until we have a school context
    retry: 1,
  });

  return {
    data: q.data ?? [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
