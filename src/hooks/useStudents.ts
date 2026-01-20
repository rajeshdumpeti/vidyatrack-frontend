import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudents } from "@/api/students.api";
import type { StudentCreateInput } from "@/types/student.types";
import { createStudent } from "@/api/students.api";

export function useStudents() {
  const query = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
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

  const mutation = useMutation({
    mutationFn: (payload: StudentCreateInput) => createStudent(payload),
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
