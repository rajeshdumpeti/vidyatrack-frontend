import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClass, getClasses } from "@/api/classes.api";
import { useAuthStore } from "@/store/auth.store"; // Import the store

export function useClasses() {
  const qc = useQueryClient();
  const { schoolId } = useAuthStore(); // Get current active school

  const list = useQuery({
    // Adding schoolId here is CRITICAL.
    // It creates a unique cache for every school.
    queryKey: ["classes", schoolId],
    queryFn: () => getClasses(schoolId!), // Pass schoolId to the API
    enabled: !!schoolId, // Only fetch if a school is selected
    retry: 1,
  });

  const create = useMutation({
    mutationFn: (payload: { name: string; school_id: number }) =>
      createClass({ ...payload, school_id: schoolId! }),
    onSuccess: async () => {
      // Invalidate ONLY the current school's list
      await qc.invalidateQueries({ queryKey: ["classes", schoolId] });
    },
  });

  return { list, create, schoolId };
}
