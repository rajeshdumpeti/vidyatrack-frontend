// src/hooks/useSections.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSections, createSection } from "@/api/sections.api";

export function useSections() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["sections"], queryFn: getSections });

  const create = useMutation({
    mutationFn: createSection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sections"] }),
  });

  return {
    sections: query.data ?? [],
    isLoading: query.isLoading,
    createSection: create.mutate,
    isCreating: create.isPending,
  };
}
