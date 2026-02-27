import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAcademicSetup } from "@/api/academicSetup.api";
import { createSection } from "@/api/sections.api";
import { useAuthStore } from "@/store/auth.store"; // Import the store

export function useSections() {
  const qc = useQueryClient();
  const { schoolId } = useAuthStore();

  const list = useQuery({
    queryKey: ["academic-setup", schoolId],
    queryFn: () => getAcademicSetup(schoolId!),
    select: (data) => data.sections,
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
      await qc.invalidateQueries({ queryKey: ["academic-setup", schoolId] });
      // Only invalidate the cache for the current school
      await qc.invalidateQueries({ queryKey: ["sections", schoolId] });
    },
  });

  return { list, create };
}
