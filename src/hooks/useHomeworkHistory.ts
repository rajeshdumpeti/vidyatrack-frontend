import { useQuery } from "@tanstack/react-query";
import { listHomework } from "@/api/communications.api";
import type { HomeworkRecordDto } from "@/types/communications.types";
import { useAuthStore } from "@/store/auth.store";
import axios from "axios";

export function useHomeworkHistory(sectionId?: number, subjectId?: number) {
  const schoolId = useAuthStore((s) => s.schoolId);

  const query = useQuery({
    queryKey: ["communications", "homework", sectionId, subjectId, schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      try {
        return await listHomework({ schoolId, sectionId, subjectId });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 422) {
          return [];
        }
        throw err;
      }
    },
    enabled: !!schoolId,
  });

  return {
    data: query.data as HomeworkRecordDto[] | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
