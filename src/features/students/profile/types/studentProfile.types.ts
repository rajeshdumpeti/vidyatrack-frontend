import type {
  StudentAttendanceSummary,
  StudentGuardian,
  StudentPersonalDetails,
  StudentProfileDto,
  StudentRecentResult,
} from "@/types/student.types";
import type { StudentNoteDto } from "@/types/studentNotes.types";

export type StudentRecentResultsGroup = {
  subject: string;
  exams: StudentRecentResult[];
};

export type StudentProfilePageData = {
  student: StudentProfileDto;
  personal: StudentPersonalDetails | null;
  guardians: StudentGuardian[];
  attendance: StudentAttendanceSummary | null;
  recentResults: StudentRecentResult[];
  groupedRecentResults: StudentRecentResultsGroup[];
  headerClassSection: string;
};

export type StudentReportWindowPayload = {
  student: StudentProfileDto;
  recentResults: StudentRecentResult[];
  attendance: StudentAttendanceSummary | null;
};

export type StudentProfileNotesState = {
  notes: StudentNoteDto[];
  notesClassFilter: string;
  setNotesClassFilter: (value: string) => void;
  notesClassOptions: string[];
  filteredNotes: StudentNoteDto[];
};

export type StudentProfileHookState = StudentProfilePageData &
  StudentProfileNotesState & {
    studentId: string;
    effectiveSchoolId: number | null;
    isGeneratingReport: boolean;
    isLoading: boolean;
    hasError: boolean;
    notesLoading: boolean;
    notesError: boolean;
    generateReportCard: () => Promise<void>;
  };
