import type { AttendanceSection } from "../types/attendance.types";
import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export async function getMyAttendanceSection(): Promise<AttendanceSection> {
  const res = await apiClient.get<AttendanceSection>(
    API_ENDPOINTS.teacher.meAttendanceSection
  );
  return res.data;
}
