export type MarksExamTypeDto = string;

export type RecordMarkRequest = {
  student_id: number;
  subject_id: number;
  exam_type: MarksExamTypeDto;
  marks_obtained: number;
  max_marks: number;
};

export type SubmitMarksRequest = {
  section_id: number;
  subject_id: string | number;
  exam_type: MarksExamTypeDto;
};
