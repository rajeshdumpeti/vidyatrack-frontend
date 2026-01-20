export type StudentListItem = {
  id: number;
  name: string;
  roll_no?: string | number | null;
};

export type StudentDto = {
  id: number;
  school_id: number;
  section_id: number;
  name: string;
  parent_phone: string;
  parent_name?: string | null;
  student_code?: string | null;
  status?: string | null;

  // Optional fields (do NOT assume they exist everywhere)
  roll_no?: string | number;
  class_name?: string | null;
  section_name?: string | null;
  class_id?: number | null;
};

export type StudentCreateInput = {
  name?: string; // send if first/last not provided
  first_name?: string;
  last_name?: string;
  section_id?: number;
  parent_phone: string;
  parent_name?: string;
  date_of_birth?: string;
  gender?: string;
  roll_number?: string | number;
  admission_date?: string;
};

export type StudentPersonalDetails = {
  date_of_birth?: string | null;
  gender?: string | null;
  blood_group?: string | null;
  religion?: string | null;
  address?: string | null;
};

export type StudentGuardian = {
  name?: string | null;
  relation?: string | null;
  phone?: string | null;
};

export type StudentAttendanceSummary = {
  percentage?: number | null;
  present_days?: number | null;
  absent_days?: number | null;
};

export type StudentRecentResult = {
  subject_name?: string | null;
  exam_type?: string | null;
  marks_obtained?: number | null;
  max_marks?: number | null;
};

export type StudentProfileDto = {
  id: number;
  name?: string | null;
  student_code?: string | null;
  class_name?: string | null;
  section_name?: string | null;
  status?: string | null;
  personal_details?: StudentPersonalDetails | null;
  guardians?: StudentGuardian[] | null;
  attendance?: StudentAttendanceSummary | null;
  recent_results?: StudentRecentResult[] | null;
};
