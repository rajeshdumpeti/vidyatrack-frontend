import { useQuery } from "@tanstack/react-query";
import { getMyAttendanceSection } from "../api/teachers.api";
import type { AttendanceSection } from "../types/attendance.types";

export function useTeacherAttendanceSection() {
  const query = useQuery({
    queryKey: ["teacher", "me", "attendance-section"],
    queryFn: getMyAttendanceSection,
  });

  return {
    data: query.data as AttendanceSection | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
