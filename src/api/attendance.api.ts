import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type {
  CreateAttendanceRequest,
  SubmitAttendanceRequest,
} from "@/types/attendance-submit.types";
import type { AttendanceRecordDto } from "@/types/attendance.types";

export async function createAttendanceRecord(payload: CreateAttendanceRequest) {
  const res = await apiClient.post(API_ENDPOINTS.attendance.create, payload);
  return res.data;
}

export async function submitAttendance(payload: SubmitAttendanceRequest) {
  const res = await apiClient.post(API_ENDPOINTS.attendance.submit, payload);
  return res.data;
}

export async function listAttendance(params: {
  date: string;
  sectionId?: number;
}): Promise<AttendanceRecordDto[]> {
  const res = await apiClient.get<AttendanceRecordDto[]>(
    API_ENDPOINTS.attendance.list,
    {
      params: params.sectionId
        ? { date: params.date, section_id: params.sectionId }
        : { date: params.date },
    }
  );
  return res.data;
}
