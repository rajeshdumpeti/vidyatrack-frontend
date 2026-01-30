export type AttendanceStatusDto = "PRESENT" | "ABSENT" | "present" | "absent";

export type CreateAttendanceRequest = {
  student_id: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatusDto;
  school_id?: number;
};

export type SubmitAttendanceRequest = {
  section_id: number;
  date: string; // YYYY-MM-DD
};
