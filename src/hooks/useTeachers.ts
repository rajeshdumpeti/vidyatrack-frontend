import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listTeachers, updateTeacherStatus } from "@/api/teachers.api";
import { queryKeys } from "@/constants/queryKeys";
import type { TeacherStatus } from "@/types/teacher.types";
import { useAuthStore } from "@/store/auth.store";

export function useTeachers(params?: { page?: number; limit?: number; search?: string }) {
  const { schoolId } = useAuthStore();
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 25;
  const search = params?.search ?? "";

  const q = useQuery({
    queryKey: queryKeys.teachersList(schoolId, { page, limit, search }),
    queryFn: () => listTeachers(schoolId!, { page, limit, search: search || undefined }),
    enabled: !!schoolId,
    retry: 1,
  });

  return {
    data: q.data?.data ?? [],
    totalPages: q.data?.total_pages ?? 1,
    total: q.data?.total ?? 0,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

export function useUpdateTeacherStatus() {
  const { schoolId } = useAuthStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      teacherId,
      status,
    }: {
      teacherId: number;
      status: TeacherStatus;
    }) => updateTeacherStatus(teacherId, schoolId!, status),
    onSuccess: () => {
      // Invalidate all teacher list queries for this school
      qc.invalidateQueries({ queryKey: ["teachers", schoolId ?? null] });
    },
  });
}
