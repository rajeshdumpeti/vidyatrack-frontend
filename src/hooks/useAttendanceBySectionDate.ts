import { useQuery } from "@tanstack/react-query";
import { listAttendanceByDateAndSection } from "../api/attendance.api";

export function useAttendanceBySectionDate(sectionId?: number, date?: string) {
  return useQuery({
    queryKey: ["attendance", "section", sectionId, date],
    enabled: Boolean(sectionId && date),
    queryFn: () =>
      listAttendanceByDateAndSection({ section_id: sectionId!, date: date! }),
  });
}
