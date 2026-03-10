import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAcademicSetup } from "@/api/academicSetup.api";
import { createSection } from "@/api/sections.api";
import { queryKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/store/auth.store";

export function useSections() {
  const qc = useQueryClient();
  const { schoolId } = useAuthStore();

  const list = useQuery({
    queryKey: queryKeys.academicSetup(schoolId),
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
    }) => createSection({ ...payload, school_id: schoolId! }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.academicSetup(schoolId) });
      await qc.invalidateQueries({ queryKey: queryKeys.sections(schoolId) });
    },
  });

  return { list, create };
}
