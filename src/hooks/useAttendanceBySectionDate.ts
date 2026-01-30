import { useQuery } from "@tanstack/react-query";
import { listAttendanceByDateAndSection } from "../api/attendance.api";

export function useAttendanceBySectionDate(
  sectionId?: number,
  date?: string,
  schoolId?: number | null,
) {
  return useQuery({
    queryKey: ["attendance", "section", sectionId, date, schoolId ?? null],
    enabled: Boolean(sectionId && date && schoolId),
    queryFn: () =>
      listAttendanceByDateAndSection({
        section_id: sectionId!,
        date: date!,
        school_id: schoolId!,
      }),
  });
}
