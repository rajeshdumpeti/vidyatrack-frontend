import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSchool, getSchools } from "@/api/schools.api";

export function useSchools(search?: string) {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 25;

  const list = useQuery({
    queryKey: ["schools", search ?? "", page],
    queryFn: () => getSchools(search, page, limit),
    retry: 1,
  });

  const create = useMutation({
    mutationFn: (payload: { name: string; admin_phone: string; admin_email?: string | null; idempotencyKey?: string }) =>
      createSchool(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["schools"] });
    },
  });

  return {
    list,
    page,
    setPage,
    limit,
    create,
  };
}
