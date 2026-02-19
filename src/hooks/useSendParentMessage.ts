import { useMutation } from "@tanstack/react-query";
import { sendParentMessage } from "@/api/communications.api";
import type { ParentMessageRequest } from "@/types/communications.types";
import { useAuthStore } from "@/store/auth.store";

export function useSendParentMessage() {
  const schoolId = useAuthStore((s) => s.schoolId);

  return useMutation({
    mutationFn: async (payload: ParentMessageRequest) => {
      if (!schoolId) {
        throw new Error("Missing school context. Please log in again.");
      }
      return sendParentMessage(payload, schoolId);
    },
  });
}
