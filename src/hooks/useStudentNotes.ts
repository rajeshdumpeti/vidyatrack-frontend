import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudentNotes, createStudentNote } from "@/api/studentNotes.api";
import type { CreateStudentNotePayload } from "@/types/studentNotes.types";
import { useAuthStore } from "@/store/auth.store";

export function useStudentNotes(studentId: number) {
  const schoolId = useAuthStore((s) => s.schoolId);
  const query = useQuery({
    queryKey: ["student-notes", studentId, schoolId ?? null],
    queryFn: () => getStudentNotes(studentId, schoolId!),
    enabled: Number.isFinite(studentId) && studentId > 0 && !!schoolId,
    retry: 1,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateStudentNote(studentId: number) {
  const qc = useQueryClient();
  const schoolId = useAuthStore((s) => s.schoolId);

  const mutation = useMutation({
    mutationFn: (payload: CreateStudentNotePayload) => {
      if (!schoolId) {
        throw new Error("Missing school context. Please log in again.");
      }
      return createStudentNote(studentId, payload, schoolId);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["student-notes", studentId] });
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
  };
}
