import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export type AttendanceSectionContext = {
  section_id: number;
  section_name: string;
  class_id: number;
  class_name: string;
};

export async function getMyAttendanceSection(): Promise<AttendanceSectionContext> {
  const res = await apiClient.get<AttendanceSectionContext>(
    API_ENDPOINTS.teacher.meAttendanceSection
  );
  return res.data;
}
