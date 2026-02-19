import { useMutation } from "@tanstack/react-query";
import { sendHomework } from "@/api/communications.api";
import type { HomeworkCreateRequest } from "@/types/communications.types";
import { useAuthStore } from "@/store/auth.store";

export function useSendHomework() {
  const schoolId = useAuthStore((s) => s.schoolId);

  return useMutation({
    mutationFn: async (payload: HomeworkCreateRequest) => {
      if (!schoolId) {
        throw new Error("Missing school context. Please log in again.");
      }
      return sendHomework(payload, schoolId);
    },
  });
}
