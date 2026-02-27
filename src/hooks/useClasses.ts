import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAcademicSetup } from "@/api/academicSetup.api";
import { createClass } from "@/api/classes.api";
import { useAuthStore } from "@/store/auth.store"; // Import the store

export function useClasses() {
  const qc = useQueryClient();
  const { schoolId } = useAuthStore(); // Get current active school

  const list = useQuery({
    queryKey: ["academic-setup", schoolId],
    queryFn: () => getAcademicSetup(schoolId!),
    select: (data) => data.classes,
    enabled: !!schoolId, // Only fetch if a school is selected
    retry: 1,
  });

  const create = useMutation({
    mutationFn: (payload: { name: string; school_id: number }) =>
      createClass({ ...payload, school_id: schoolId! }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["academic-setup", schoolId] });
      // Invalidate ONLY the current school's list
      await qc.invalidateQueries({ queryKey: ["classes", schoolId] });
    },
  });

  return { list, create, schoolId };
}
