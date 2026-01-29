import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSection, getSections } from "@/api/sections.api";

export function useSections() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["sections"],
    queryFn: getSections,
    retry: 1,
  });

  const create = useMutation({
    mutationFn: (payload: { class_id: number; name: string }) =>
      createSection(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["sections"] });
    },
  });

  return { list, create };
}
