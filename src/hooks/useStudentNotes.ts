import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudentNotes, createStudentNote } from "@/api/studentNotes.api";
import { queryKeys } from "@/constants/queryKeys";
import { requireSchoolId } from "@/utils/requireSchoolId";
import type { CreateStudentNotePayload } from "@/types/studentNotes.types";
import { useAuthStore } from "@/store/auth.store";

export function useStudentNotes(studentId: string) {
  const schoolId = useAuthStore((s) => s.schoolId);
  const query = useQuery({
    queryKey: queryKeys.studentNotes(studentId, schoolId),
    queryFn: () => getStudentNotes(studentId, schoolId!),
    enabled: !!studentId && !!schoolId,
    retry: 1,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateStudentNote(studentId: string) {
  const qc = useQueryClient();
  const schoolId = useAuthStore((s) => s.schoolId);

  const mutation = useMutation({
    mutationFn: (payload: CreateStudentNotePayload) =>
      createStudentNote(studentId, payload, requireSchoolId(schoolId)),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: queryKeys.studentNotes(studentId, schoolId),
      });
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
  };
}
