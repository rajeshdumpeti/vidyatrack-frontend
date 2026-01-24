import { useMutation } from "@tanstack/react-query";
import { createAttendanceRecord } from "@/api/attendance.api";
import type { CreateAttendanceRequest } from "@/types/attendance-submit.types";

export function useCreateAttendanceRecord() {
  return useMutation({
    mutationFn: (payload: CreateAttendanceRequest) =>
      createAttendanceRecord(payload),
  });
}
