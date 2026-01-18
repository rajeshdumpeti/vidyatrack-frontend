import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTeacherInput } from "@/types/teacher.types";
import { createManagementTeacher } from "@/api/managementTeachers";

export function useCreateManagementTeacher() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTeacherInput) =>
      createManagementTeacher(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}
