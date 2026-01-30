import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAttendanceStatus } from "../api/attendance.api";

export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn remains the same, but now it expects the full params object
    mutationFn: updateAttendanceStatus,

    // Tech Lead Tip: Invalidate the 'attendance' query so the UI
    // refreshes with the new 'id' from the database after saving.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}
