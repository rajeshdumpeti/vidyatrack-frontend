import type { Dispatch, SetStateAction } from "react";
import type { FieldErrors, UseFormHandleSubmit, UseFormRegister, UseFormReset, UseFormSetValue } from "react-hook-form";

import type { StudentListItem } from "@/types/student.types";
import type { TeachingAssignmentMeDto } from "@/types/teachingAssignment.types";

export type FormValues = {
  maxMarks: string;
  assignmentId: string;
  marks: Record<string, string>;
};

export type ExamTypePreset = {
  label: string;
  value: string;
};

export type EnterMarksState = {
  assignmentClassLabel: string;
  assignmentSectionLabel: string;
  assignmentSubjectLabel: string;
  selectedAssignment: TeachingAssignmentMeDto | undefined;
  activeExamType: string;
  showCustomExamInput: boolean;
  customExamDraft: string;
  customExamChips: string[];
  setShowCustomExamInput: Dispatch<SetStateAction<boolean>>;
  setCustomExamDraft: Dispatch<SetStateAction<string>>;
  addCustomExamChip: () => void;
  applyExamContext: (examType: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isAutoSaving: boolean;
  showConfirmModal: boolean;
  setShowConfirmModal: (value: boolean) => void;
  isSubmitting: boolean;
  loadingExistingMarks: boolean;
  fetchingExistingMarks: boolean;
  isContextLoading: boolean;
  hasExistingMarks: boolean;
  existingMarksCount: number;
  existingMarksMap: Record<string, string>;
  lockMaxMarks: boolean;
  totalStudents: number;
  filledMarks: number;
  completionPercentage: number;
  hasValidExamType: boolean;
  filteredStudents: StudentListItem[];
  showStudentRows: boolean;
  maxMarks: number;
  errors: FieldErrors<FormValues>;
  register: UseFormRegister<FormValues>;
  handleSubmit: UseFormHandleSubmit<FormValues>;
  reset: UseFormReset<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  watchAssignmentId: string;
  marks: Record<string, string>;
  handleSaveDraft: (values: FormValues) => void;
  handleOpenConfirmation: (values: FormValues) => void;
  handleFinalSubmit: () => void;
};
