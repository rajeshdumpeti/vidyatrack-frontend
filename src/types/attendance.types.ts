export type AttendanceSection = {
  section_id: number;
  section_name: string;
  class_id: number;
  class_name: string;
};

export type AttendanceStatus = "PRESENT" | "ABSENT" | "present" | "absent";

export type AttendanceRecordDto = {
  id: number;
  school_id: number;
  student_id: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  marked_by_user_id: number;
};
