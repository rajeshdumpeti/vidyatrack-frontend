import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSchool, getSchools } from "@/api/schools.api";

export function useSchools(search?: string) {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["schools", search ?? ""],
    queryFn: () => getSchools(search),
    retry: 1,
  });

  const create = useMutation({
    mutationFn: (payload: { name: string; admin_phone: string; admin_email?: string | null; idempotencyKey?: string }) =>
      createSchool(payload),
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
