import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTeachers } from "../api/teachers.api";
import type { TeacherDto } from "../types/teacher.types";

export function useTeacherById(teacherId: number) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["teachers"],
    queryFn: getTeachers,
    enabled: Number.isFinite(teacherId) && teacherId > 0,
    retry: 1,
    initialData: () => {
      const cached = qc.getQueryData<TeacherDto[]>(["teachers"]);
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
