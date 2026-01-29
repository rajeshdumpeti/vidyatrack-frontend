import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClass, getClasses } from "@/api/classes.api";

export function useClasses() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["classes"],
    queryFn: getClasses,
    retry: 1,
  });

  const create = useMutation({
    mutationFn: (payload: { name: string }) => createClass(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["classes"] });
    },
  });

  return { list, create };
}
