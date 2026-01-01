export type AttendanceStatusDto = "PRESENT" | "ABSENT";

export type CreateAttendanceRequest = {
  student_id: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatusDto;
};

export type SubmitAttendanceRequest = {
  section_id: number;
  date: string; // YYYY-MM-DD
};
