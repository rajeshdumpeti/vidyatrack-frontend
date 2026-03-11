import { useQuery } from "@tanstack/react-query";
import { getMyAttendanceSection } from "@/api/teachers.api";
import { queryKeys } from "@/constants/queryKeys";

/**
 * Single source of truth for teacher's primary attendance section context.
 * Reused by TeacherDashboard, MarkAttendance, etc.
 */
export function useAttendanceSection() {
  return useQuery({
    queryKey: queryKeys.attendanceSection(),
    queryFn: getMyAttendanceSection,
  });
}
