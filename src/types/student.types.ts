export type StudentListItem = {
  id: number;
  name: string;
  roll_no?: string | number | null;
  public_id?: string | number | null;
};

export type StudentDto = {
  id: number;
  public_id?: string;
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

export type StudentImportPreviewRow = {
  row_number: number;
  status: "valid" | "invalid" | "duplicate";
  errors: string[];
  student_name?: string | null;
  parent_phone?: string | null;
  class_name?: string | null;
  section_name?: string | null;
  roll_number?: string | null;
};

export type StudentImportPreviewResponse = {
  import_token?: string | null;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  rows: StudentImportPreviewRow[];
};

export type StudentImportCommitInput = {
  import_token: string;
  mode?: "skip_duplicates";
};

export type StudentImportCommitResponse = {
  total_rows: number;
  created_rows: number;
  duplicate_rows: number;
  failed_rows: number;
  errors: StudentImportPreviewRow[];
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
  public_id?: string;
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

export type StudentReportCardRow = {
  subject_name: string;
  exam_type: string;
  marks_obtained: number;
  max_marks: number;
  percentage: number;
  grade: string;
};

export type StudentReportCardDto = {
  student_id: number;
  student_name: string;
  student_code: string;
  class_name?: string | null;
  section_name?: string | null;
  attendance_percentage: number;
  present_days: number;
  absent_days: number;
  total_days: number;
  total_obtained: number;
  total_max: number;
  overall_percentage: number;
  overall_grade: string;
  generated_at: string;
  rows: StudentReportCardRow[];
};
