// src/hooks/useClasses.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClass, getClasses } from "@/api/classes.api";

export function useClasses() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["classes"],
    queryFn: getClasses,
  });

  const createMutation = useMutation({
    mutationFn: createClass,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["classes"] }),
  });

  return {
    classes: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    createClass: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
