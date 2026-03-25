import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTeacherInput } from "@/types/teacher.types";
import { createManagementTeacher } from "@/api/managementTeachers";
import { queryKeys } from "@/constants/queryKeys";
import { requireSchoolId } from "@/utils/requireSchoolId";
import { useAuthStore } from "@/store/auth.store";

export function useCreateManagementTeacher() {
  const qc = useQueryClient();
  const { schoolId } = useAuthStore();

  return useMutation({
    mutationFn: (payload: CreateTeacherInput) =>
      createManagementTeacher({
        ...payload,
        school_id: requireSchoolId(schoolId),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.teachers(schoolId) });
    },
  });
}
