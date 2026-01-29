import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSection, getSections } from "@/api/sections.api";
import { useAuthStore } from "@/store/auth.store"; // Import the store

export function useSections() {
  const qc = useQueryClient();
  const { schoolId } = useAuthStore();

  const list = useQuery({
    // Adding schoolId ensures School A sections don't show up in School B
    queryKey: ["sections", schoolId],
    queryFn: () => getSections(schoolId!),
    enabled: !!schoolId,
    retry: 1,
  });

  const create = useMutation({
    mutationFn: (payload: {
      class_id: number;
      name: string;
      school_id: number;
    }) => createSection({ ...payload, school_id: schoolId! }), // Inject schoolId here
    onSuccess: async () => {
      // Only invalidate the cache for the current school
      await qc.invalidateQueries({ queryKey: ["sections", schoolId] });
    },
  });

  return { list, create };
}
