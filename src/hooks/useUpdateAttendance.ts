import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { updateAttendanceStatus } from "../api/attendance.api";

export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAttendanceStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendanceRoot() });
    },
  });
}
