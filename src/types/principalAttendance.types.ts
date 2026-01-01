export type AttendanceStatusDto = "PRESENT" | "ABSENT";

export type PrincipalAttendanceRowDto = {
  id: number;
  school_id: number;
  student_id: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatusDto;
  marked_by_user_id: number;

  // Optional if backend enriches later (do NOT join client-side)
  student_name?: string;
  roll_no?: string | number;
  section_id?: number;
};
