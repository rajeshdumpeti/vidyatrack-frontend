import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { listAttendanceByDateAndSection } from "../api/attendance.api";

export function useAttendanceBySectionDate(
  sectionId?: number,
  date?: string,
  schoolId?: number | null,
) {
  return useQuery({
    queryKey: ["attendance", "section", sectionId, date, schoolId ?? null],
    enabled: Boolean(sectionId && date && schoolId),
    queryFn: async () => {
      try {
        return await listAttendanceByDateAndSection({
          section_id: sectionId!,
          date: date!,
          school_id: schoolId!,
        });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 422) {
          return [];
        }
        throw err;
      }
    },
  });
}
