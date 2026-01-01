export type ExamTypeDto =
  | "UNIT_TEST"
  | "MONTHLY_TEST"
  | "QUARTERLY"
  | "HALF_YEARLY"
  | "ANNUAL";

export type PrincipalMarksRowDto = {
  id: number;
  school_id: number;
  student_id: number;
  subject_id: number;
  exam_type: ExamTypeDto;
  marks_obtained: number;
  max_marks: number;
  recorded_by_user_id: number;

  // Optional if backend enriches later (do NOT join client-side)
  student_name?: string;
  roll_no?: string | number;
  section_id?: number;
};
