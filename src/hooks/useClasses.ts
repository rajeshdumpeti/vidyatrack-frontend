import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAcademicSetup } from "@/api/academicSetup.api";
import { createClass } from "@/api/classes.api";
import { queryKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/store/auth.store";

export function useClasses() {
  const qc = useQueryClient();
  const { schoolId } = useAuthStore();

  const list = useQuery({
    queryKey: queryKeys.academicSetup(schoolId),
    queryFn: () => getAcademicSetup(schoolId!),
    select: (data) => data.classes,
    enabled: !!schoolId,
    retry: 1,
  });

  const create = useMutation({
    mutationFn: (payload: { name: string; school_id: number }) =>
      createClass({ ...payload, school_id: schoolId! }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.academicSetup(schoolId) });
      await qc.invalidateQueries({ queryKey: queryKeys.classes(schoolId) });
    },
  });

  return { list, create, schoolId };
}
