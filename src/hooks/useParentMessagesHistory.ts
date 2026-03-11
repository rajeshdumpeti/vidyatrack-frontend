import { useQuery } from "@tanstack/react-query";
import { listParentMessages } from "@/api/communications.api";
import { queryKeys } from "@/constants/queryKeys";
import type { ParentMessageRecordDto } from "@/types/communications.types";
import { useAuthStore } from "@/store/auth.store";
import axios from "axios";

export function useParentMessagesHistory(sectionId?: number) {
  const schoolId = useAuthStore((s) => s.schoolId);

  const query = useQuery({
    queryKey: queryKeys.parentMessagesHistory(sectionId, schoolId),
    queryFn: async () => {
      if (!schoolId) return [];
      try {
        return await listParentMessages({ schoolId, sectionId });
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
    data: query.data as ParentMessageRecordDto[] | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
