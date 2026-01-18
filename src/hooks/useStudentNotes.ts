import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudentNotes, createStudentNote } from "@/api/studentNotes.api";
import type { CreateStudentNotePayload } from "@/types/studentNotes.types";

export function useStudentNotes(studentId: number) {
  const query = useQuery({
    queryKey: ["student-notes", studentId],
    queryFn: () => getStudentNotes(studentId),
    enabled: Number.isFinite(studentId) && studentId > 0,
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

  const mutation = useMutation({
    mutationFn: (payload: CreateStudentNotePayload) =>
      createStudentNote(studentId, payload),
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
