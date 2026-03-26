export type AssignSubjectsClassDto = {
  id: number;
  name: string;
};

export type AssignSubjectsSectionDto = {
  id: number;
  name: string;
  class_id: number;
};

export type AssignSubjectsSubjectDto = {
  id: number;
  name: string;
};

export type AssignSubjectsTeacherDto = {
  id: number;
  name?: string | null;
  phone?: string | null;
  status?: string | null;
};

export type AssignSubjectsRowMessage = Record<
  number,
  { text: string; type: "success" | "error" }
>;

export type HistoryTarget = {
  sectionId: number;
  subjectId: number;
  subjectName: string;
};
