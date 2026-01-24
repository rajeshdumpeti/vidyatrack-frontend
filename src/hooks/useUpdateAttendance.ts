import { useMutation } from "@tanstack/react-query";
import { updateAttendanceStatus } from "../api/attendance.api";

export function useUpdateAttendance() {
  return useMutation({
    mutationFn: updateAttendanceStatus,
  });
}
