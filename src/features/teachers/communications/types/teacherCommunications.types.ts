import type { RefObject } from "react";

import type { HomeworkRecordDto, ParentMessageRecordDto } from "@/types/communications.types";
import type { StudentNoteDto } from "@/types/studentNotes.types";
import type { StudentDto } from "@/types/student.types";
import type { TeachingAssignmentMeDto } from "@/types/teachingAssignment.types";

export type TabKey = "homework" | "parents" | "notes";

export type ParentStudent = StudentDto;

export type TeacherCommunicationsNavigationState = Partial<
  Pick<
    TeachingAssignmentMeDto,
    "section_id" | "subject_id" | "subject_name" | "class_name" | "section_name"
  >
>;

export type TeacherCommunicationsState = {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  assignments: TeachingAssignmentMeDto[];
  assignmentClassLabel: string;
  assignmentSectionLabel: string;
  assignmentSubjectLabel: string;
  selectedAssignment: TeachingAssignmentMeDto | undefined;
  sectionLoading: boolean;
  sectionError: unknown;
  refetchSection: () => unknown;
  assignmentsLoading: boolean;
  refetchAssignments: () => unknown;
  studentsLoading: boolean;
  studentsCount: number;
  parentStudents: ParentStudent[];
  filteredParents: ParentStudent[];
  selectedParentIds: number[];
  parentSearch: string;
  setParentSearch: (value: string) => void;
  toggleParent: (id: number) => void;
  selectAllParents: () => void;
  clearParentSelection: () => void;
  parentSubject: string;
  setParentSubject: (value: string) => void;
  parentMessage: string;
  setParentMessage: (value: string) => void;
  parentToast: "sending" | "sent" | null;
  dismissParentToast: () => void;
  canSendParentMessage: boolean;
  sendParentMessage: () => void;
  parentMessagePending: boolean;
  parentMessageError: boolean;
  parentMessageSuccess: boolean;
  parentMessageItems: ParentMessageRecordDto[];
  parentMessagesHistoryLoading: boolean;
  parentMessagesHistoryError: unknown;
  homeworkTitle: string;
  setHomeworkTitle: (value: string) => void;
  homeworkDescription: string;
  setHomeworkDescription: (value: string) => void;
  homeworkDueDate: string;
  setHomeworkDueDate: (value: string) => void;
  homeworkToast: "sending" | "sent" | null;
  dismissHomeworkToast: () => void;
  canSendHomework: boolean;
  sendHomework: () => void;
  homeworkPending: boolean;
  homeworkError: boolean;
  homeworkItems: HomeworkRecordDto[];
  homeworkHistoryLoading: boolean;
  homeworkHistoryError: unknown;
  noteStudentSearch: string;
  setNoteStudentSearch: (value: string) => void;
  isNoteSearchOpen: boolean;
  setIsNoteSearchOpen: (open: boolean) => void;
  noteSearchRef: RefObject<HTMLDivElement | null>;
  filteredNoteStudents: ParentStudent[];
  studentId: string;
  noteText: string;
  setNoteText: (value: string) => void;
  selectNoteStudent: (student: ParentStudent) => void;
  selectedStudent: ParentStudent | undefined;
  notes: StudentNoteDto[];
  isLoadingNotes: boolean;
  isSavingNote: boolean;
  noteError: string | null;
  noteSuccess: string | null;
  saveNote: () => Promise<void>;
};
