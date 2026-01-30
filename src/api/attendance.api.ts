import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type {
  CreateAttendanceRequest,
  SubmitAttendanceRequest,
} from "@/types/attendance-submit.types";
import type {
  AttendanceRecordDto,
  AttendanceStatus,
} from "@/types/attendance.types";

export async function createAttendanceRecord(
  payload: CreateAttendanceRequest,
  schoolId: number,
) {
  const res = await apiClient.post(
    API_ENDPOINTS.attendance.create,
    payload,
    { params: { school_id: schoolId } }, // Force school_id into the query string
  );
  return res.data;
}

export async function submitAttendance(
  payload: SubmitAttendanceRequest,
  schoolId: number,
) {
  const res = await apiClient.post(API_ENDPOINTS.attendance.submit, payload, {
    params: { school_id: schoolId }, // Axios serializes this correctly
  });
  return res.data;
}

// ... existing imports

export async function listAttendance(params: {
  date: string;
  sectionId?: number;
  school_id: number;
}) {
  return await apiClient.get(API_ENDPOINTS.attendance.list, {
    // EVERYTHING in this object becomes part of the "?key=value" string
    params: {
      date: params.date,
      section_id: params.sectionId, // Ensure the key matches Python (snake_case)
      school_id: params.school_id, // Ensure this matches Python exactly
    },
  });
}

export async function listAttendanceByDateAndSection(params: {
  date: string;
  section_id: number;
  school_id: number; // ADDED
}): Promise<AttendanceRecordDto[]> {
  const res = await apiClient.get<AttendanceRecordDto[]>(
    API_ENDPOINTS.attendance.list,
    {
      params, // This now includes school_id
    },
  );
  return res.data;
}
export async function updateAttendanceStatus(params: {
  attendance_id: number;
  student_id: number; // Added
  school_id: number; // Added
  date: string; // Added
  status: AttendanceStatus;
}): Promise<AttendanceRecordDto> {
  // Use the new dynamic endpoint function we defined in API_ENDPOINTS
  const url = API_ENDPOINTS.attendance.update(
    params.attendance_id,
    params.school_id,
    params.student_id,
    params.date,
  );

  const res = await apiClient.put<AttendanceRecordDto>(url, {
    status: params.status,
  });
  return res.data;
}
