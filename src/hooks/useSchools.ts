import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSchool, getSchools } from "../api/schools.api";

export function useSchools() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["schools"],
    queryFn: getSchools,
    retry: 1,
  });

  const create = useMutation({
    mutationFn: (payload: { name: string }) => createSchool(payload),
    onSuccess: async () => {
      // safest: refetch to reflect server truth
      await qc.invalidateQueries({ queryKey: ["schools"] });
    },
  });

  return {
    list,
    create,
  };
}
