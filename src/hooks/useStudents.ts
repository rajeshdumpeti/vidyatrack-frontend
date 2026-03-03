import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudents } from "@/api/students.api";
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

export function useStudents() {
  const schoolId = useAuthStore((s) => s.schoolId);
  const query = useQuery({
    queryKey: ["students", schoolId ?? null],
    queryFn: () => getStudents(schoolId!),
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
    mutationFn: (payload: StudentCreateInput) => {
      if (!schoolId) {
        throw new Error("Missing school context. Please log in again.");
      }
      return createStudent(payload, schoolId);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["students"] });
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
    mutationFn: (file: File) => {
      if (!schoolId) {
        throw new Error("Missing school context. Please log in again.");
      }
      return previewStudentsImport(file, schoolId);
    },
  });
}

export function useCommitStudentsImport() {
  const schoolId = useAuthStore((s) => s.schoolId);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StudentImportCommitInput) => {
      if (!schoolId) {
        throw new Error("Missing school context. Please log in again.");
      }
      return commitStudentsImport(payload, schoolId);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
