import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTeacherInput } from "@/types/teacher.types";
import { createManagementTeacher } from "@/api/managementTeachers";
import { useAuthStore } from "@/store/auth.store";

export function useCreateManagementTeacher() {
  const qc = useQueryClient();
  const { schoolId } = useAuthStore();

  return useMutation({
    // We cast the argument to include school_id for this specific call
    mutationFn: (payload: CreateTeacherInput) =>
      createManagementTeacher({ ...payload, school_id: schoolId! } as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers", schoolId] });
    },
  });
}
