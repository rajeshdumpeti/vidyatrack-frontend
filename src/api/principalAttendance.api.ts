import { apiClient } from "./apiClient";
import type { PrincipalAttendanceRowDto } from "@/types/principalAttendance.types";

export async function getPrincipalAttendance(params: {
  date: string; // YYYY-MM-DD
  sectionId?: number;
}): Promise<PrincipalAttendanceRowDto[]> {
  const res = await apiClient.get<PrincipalAttendanceRowDto[]>(
    "/api/v1/attendance",
    {
      params: params.sectionId
        ? { date: params.date, section_id: params.sectionId }
        : { date: params.date },
    }
  );

  return res.data;
}
