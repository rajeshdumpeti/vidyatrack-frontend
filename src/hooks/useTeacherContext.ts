import { useQuery } from "@tanstack/react-query";

import { getTeacherContext } from "@/api/teachers.api";
import { queryKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/store/auth.store";

export function useTeacherContext() {
  const schoolId = useAuthStore((s) => s.schoolId);

  return useQuery({
    queryKey: queryKeys.teacherContext(schoolId),
    queryFn: () => getTeacherContext(schoolId!),
    enabled: !!schoolId,
    retry: 1,
  });
}
