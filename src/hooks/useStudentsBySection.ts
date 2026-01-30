import { useQuery } from "@tanstack/react-query";
import { getStudentsBySection } from "@/api/students.api";
import type { StudentListItem } from "@/types/student.types";
import { useAuthStore } from "@/store/auth.store"; // 1. Import your auth store

export function useStudentsBySection(sectionId?: number) {
  const { schoolId } = useAuthStore(); // 2. Get the schoolId from global state

  const query = useQuery({
    // 3. Add schoolId to the queryKey so the cache is unique per school
    queryKey: ["students", "by-section", sectionId, schoolId],

    queryFn: async () => {
      // 4. Safety check: shouldn't run without both IDs
      if (typeof sectionId !== "number" || !schoolId) {
        throw new Error("Missing sectionId or schoolId");
      }

      // 5. Pass both parameters to the API function
      return getStudentsBySection(sectionId, schoolId);
    },

    // 6. Only enable if we have both IDs
    enabled: typeof sectionId === "number" && !!schoolId,
  });

  return {
    data: query.data as StudentListItem[] | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
