import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudents } from "@/api/students.api";
import { queryKeys } from "@/constants/queryKeys";
import { requireSchoolId } from "@/helpers/requireSchoolId";
import type {
  StudentCreateInput,
  StudentImportCommitInput,
} from "@/types/student.types";
import {
  createStudent,
  previewStudentsImport,
  commitStudentsImport,
} from "@/api/students.api";
import { useAuthStore } from "@/store/auth.store";

export function useStudents(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sectionId?: number | null;
}) {
  const schoolId = useAuthStore((s) => s.schoolId);
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 25;
  const search = params?.search ?? "";
  const sectionId = params?.sectionId ?? null;

  const query = useQuery({
    queryKey: queryKeys.studentsList(schoolId, { page, limit, search, sectionId }),
    queryFn: () =>
      getStudents(schoolId!, { page, limit, search: search || undefined, sectionId }),
    enabled: !!schoolId,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateStudent() {
  const qc = useQueryClient();
  const schoolId = useAuthStore((s) => s.schoolId);

  const mutation = useMutation({
    mutationFn: (payload: StudentCreateInput) =>
      createStudent(payload, requireSchoolId(schoolId)),
    onSuccess: async () => {
      // Invalidate all students queries for this school (prefix match)
      await qc.invalidateQueries({ queryKey: queryKeys.students(schoolId) });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

export function usePreviewStudentsImport() {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useMutation({
    mutationFn: (file: File) =>
      previewStudentsImport(file, requireSchoolId(schoolId)),
  });
}

export function useCommitStudentsImport() {
  const schoolId = useAuthStore((s) => s.schoolId);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StudentImportCommitInput) =>
      commitStudentsImport(payload, requireSchoolId(schoolId)),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.students(schoolId) });
    },
  });
}

