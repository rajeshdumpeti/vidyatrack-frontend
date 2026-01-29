// src/hooks/useSubjects.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listSubjects, createSubject } from "@/api/subjects.api";
import type { SubjectCreateInput } from "@/types/subject.types";

export function useSubjects() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["subjects"], queryFn: listSubjects });

  const create = useMutation({
    mutationFn: createSubject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });

  return {
    subjects: query.data ?? [],
    isLoading: query.isLoading,
    createSubject: create.mutate,
    isCreating: create.isPending,
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
