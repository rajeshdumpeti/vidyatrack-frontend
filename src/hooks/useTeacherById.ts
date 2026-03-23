import { useQuery } from "@tanstack/react-query";
import { listTeachers } from "@/api/teachers.api";
import { queryKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/store/auth.store";

export function useTeacherById(teacherId: number) {
  const schoolId = useAuthStore((s) => s.schoolId);

  const query = useQuery({
    queryKey: queryKeys.teachersList(schoolId, { page: 1, limit: 200, search: "" }),
    queryFn: () => listTeachers(schoolId!, { page: 1, limit: 200 }),
    enabled: Number.isFinite(teacherId) && teacherId > 0 && !!schoolId,
    retry: 1,
  });

  const teacher = (query.data?.data ?? []).find((t) => t.id === teacherId) ?? null;

  return {
    teacher,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
