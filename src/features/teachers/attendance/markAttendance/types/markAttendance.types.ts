import type { AttendanceRecordDto } from "@/types/attendance.types";

export type StudentUi = {
  id: string;
  rollNo: string;
  name: string;
  initials: string;
};

export type AttendanceStatus = "PRESENT" | "ABSENT";

export type AttendanceMapValue = {
  attendance_id: number;
  status: AttendanceStatus;
};

export type AttendanceCounts = {
  total: number;
  present: number;
  absent: number;
};

export type AttendanceMutationHandler = {
  onSuccess: (data: AttendanceRecordDto) => void;
  onError: (error: unknown) => void;
};
