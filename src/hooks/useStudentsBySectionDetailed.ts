import { useQuery } from "@tanstack/react-query";
import { getStudentsBySectionId } from "@/api/students.api";
import { queryKeys } from "@/constants/queryKeys";
import type { StudentDto } from "@/types/student.types";
import { useAuthStore } from "@/store/auth.store";
import axios from "axios";

export function useStudentsBySectionDetailed(sectionId?: number) {
  const schoolId = useAuthStore((s) => s.schoolId);

  const query = useQuery({
    queryKey: queryKeys.studentsBySectionDetailed(sectionId, schoolId),
    queryFn: async () => {
      if (typeof sectionId !== "number" || !schoolId) {
        throw new Error("Missing sectionId or schoolId");
      }
      try {
        return await getStudentsBySectionId(sectionId, schoolId);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 422) {
          return [];
        }
        throw err;
      }
    },
    enabled: typeof sectionId === "number" && !!schoolId,
  });

  return {
    data: query.data as StudentDto[] | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
