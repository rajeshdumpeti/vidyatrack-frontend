import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listTeachers } from "@/api/teachers.api";
import { queryKeys } from "@/constants/queryKeys";
import type { TeacherDto } from "@/types/teacher.types";
import { useAuthStore } from "@/store/auth.store";

export function useTeacherById(teacherId: number) {
  const qc = useQueryClient();
  const schoolId = useAuthStore((s) => s.schoolId);

  const query = useQuery({
    queryKey: queryKeys.teachers(schoolId),
    queryFn: () => listTeachers(schoolId!),
    enabled: Number.isFinite(teacherId) && teacherId > 0 && !!schoolId,
    retry: 1,
    initialData: () => {
      const cached = qc.getQueryData<TeacherDto[]>(queryKeys.teachers(schoolId));
      return cached;
    },
  });

  const teacher = query.data?.find((t) => t.id === teacherId) ?? null;

  return {
    teacher,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
