import { createSchool, getSchools } from "@/api/schools.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// src/hooks/useSchools.ts
export function useSchools() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["schools"],
    queryFn: getSchools,
    staleTime: 5 * 60 * 1000, // 5 minutes of fresh data
  });

  const createMutation = useMutation({
    mutationFn: createSchool,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schools"] });
    },
  });

  return {
    schools: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createSchool: createMutation.mutate,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
  };
}
