import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type {
  CreateAttendanceRequest,
  SubmitAttendanceRequest,
} from "../types/attendance-submit.types";

export async function createAttendanceRecord(payload: CreateAttendanceRequest) {
  const res = await apiClient.post(API_ENDPOINTS.attendance.create, payload);
  return res.data;
}

export async function submitAttendance(payload: SubmitAttendanceRequest) {
  const res = await apiClient.post(API_ENDPOINTS.attendance.submit, payload);
  return res.data;
}
