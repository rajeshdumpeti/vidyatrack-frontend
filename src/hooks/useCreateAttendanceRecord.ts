import { useMutation } from "@tanstack/react-query";
import { createAttendanceRecord } from "@/api/attendance.api";
import type { CreateAttendanceRequest } from "@/types/attendance-submit.types";
import { useAuthStore } from "@/store/auth.store";

export function useCreateAttendanceRecord() {
  const schoolId = useAuthStore((s) => s.schoolId);

  return useMutation({
    mutationFn: (payload: CreateAttendanceRequest) => {
      if (!schoolId) {
        throw new Error("Missing school context. Please log in again.");
      }
      return createAttendanceRecord(payload, schoolId);
    },
  });
}
