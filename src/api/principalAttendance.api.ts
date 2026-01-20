import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type { PrincipalAttendanceRowDto } from "@/types/principalAttendance.types";

export async function getPrincipalAttendance(params: {
  date: string; // YYYY-MM-DD
  sectionId?: number;
}): Promise<PrincipalAttendanceRowDto[]> {
  const res = await apiClient.get<PrincipalAttendanceRowDto[]>(
    API_ENDPOINTS.attendance.list,
    {
      params: params.sectionId
        ? { date: params.date, section_id: params.sectionId }
        : { date: params.date },
    }
  );

  return res.data;
}
