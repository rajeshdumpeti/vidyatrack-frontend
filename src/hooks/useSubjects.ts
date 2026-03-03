import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAcademicSetup } from "@/api/academicSetup.api";
import { createSubject } from "@/api/subjects.api";
import { useAuthStore } from "@/store/auth.store";

export function useSubjects() {
  const { schoolId } = useAuthStore();
  const q = useQuery({
    queryKey: ["academic-setup", schoolId],
    queryFn: () => getAcademicSetup(schoolId!),
    select: (data) => data.subjects,
    enabled: !!schoolId,
    retry: 1,
  });

  return {
    data: q.data ?? [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
    schoolId,
  };
}

export function useCreateSubject() {
  const qc = useQueryClient();
  const { schoolId } = useAuthStore();

  return useMutation({
    mutationFn: (payload: { name: string }) =>
      createSubject({ ...payload, school_id: schoolId! }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academic-setup", schoolId] });
      qc.invalidateQueries({ queryKey: ["subjects", schoolId] });
    },
  });
}
