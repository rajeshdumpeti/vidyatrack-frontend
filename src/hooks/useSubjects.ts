import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSubject, listSubjects } from "../api/subjects.api";
import type { SubjectCreateInput } from "../types/subject.types";

export function useSubjects() {
  const q = useQuery({
    queryKey: ["subjects"],
    queryFn: listSubjects,
    retry: 1,
  });

  return {
    data: q.data ?? [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

export function useCreateSubject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubjectCreateInput) => createSubject(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}
