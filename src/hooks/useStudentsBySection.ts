import { useQuery } from "@tanstack/react-query";
import { getStudentsBySection } from "@/api/students.api";
import { queryKeys } from "@/constants/queryKeys";
import type { StudentListItem } from "@/types/student.types";
import { useAuthStore } from "@/store/auth.store";
import axios from "axios";

export function useStudentsBySection(sectionId?: number) {
  const { schoolId } = useAuthStore();

  const query = useQuery({
    queryKey: queryKeys.studentsBySection(sectionId, schoolId),

    queryFn: async () => {
      if (typeof sectionId !== "number" || !schoolId) {
        throw new Error("Missing sectionId or schoolId");
      }

      try {
        return await getStudentsBySection(sectionId, schoolId);
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
    data: query.data as StudentListItem[] | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
