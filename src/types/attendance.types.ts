export type AttendanceSection = {
  section_id: number;
  section_name: string;
  class_id: number;
  class_name: string;
};

export type AttendanceStatus = "present" | "absent";
