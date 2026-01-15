import type { AttendanceSection } from "../types/attendance.types";
import type { TeacherDto, Teacher } from "../types/teacher.types";
import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export async function getMyAttendanceSection(): Promise<AttendanceSection> {
  const res = await apiClient.get<AttendanceSection>(
    API_ENDPOINTS.teacher.meAttendanceSection
  );
  return res.data;
}

export async function getTeachers(): Promise<TeacherDto[]> {
  const res = await apiClient.get<TeacherDto[]>(API_ENDPOINTS.teachers.list);
  return res.data;
}

export async function listTeachers(): Promise<Teacher[]> {
  const res = await apiClient.get<Teacher[]>(API_ENDPOINTS.teachers.list);
  return res.data;
}
