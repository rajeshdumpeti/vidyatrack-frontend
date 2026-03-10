import type { RefObject } from "react";

import type {
  HomeworkRecordDto,
  ParentMessageRecordDto,
} from "@/types/communications.types";
import type { StudentNoteDto } from "@/types/studentNotes.types";
import type { StudentDto } from "@/types/student.types";

export type PrincipalCommunicationsTabKey = "homework" | "parents" | "notes";

export type PrincipalStudent = StudentDto;

export type PrincipalCommunicationsState = {
  activeTab: PrincipalCommunicationsTabKey;
  setActiveTab: (tab: PrincipalCommunicationsTabKey) => void;
  selectedClassId: number | "";
  setSelectedClassId: (value: number | "") => void;
  selectedSectionId: number | "";
  setSelectedSectionId: (value: number | "") => void;
  selectedSubjectId: number | "";
  setSelectedSubjectId: (value: number | "") => void;
  classes: Array<{ id: number; name: string }>;
  sections: Array<{ id: number; name: string; class_id: number }>;
  subjects: Array<{ id: number; name: string }>;
  filteredSections: Array<{ id: number; name: string; class_id: number }>;
  studentsCount: number;
  loadingSetup: boolean;
  setupError: boolean;
  isSetupComplete: boolean;
  parentStudents: PrincipalStudent[];
  filteredParents: PrincipalStudent[];
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
  filteredNoteStudents: PrincipalStudent[];
  studentId: string;
  noteText: string;
  setNoteText: (value: string) => void;
  selectNoteStudent: (student: PrincipalStudent) => void;
  selectedStudent: PrincipalStudent | undefined;
  notes: StudentNoteDto[];
  isLoadingNotes: boolean;
  isSavingNote: boolean;
  noteError: string | null;
  noteSuccess: string | null;
  saveNote: () => Promise<void>;
};
