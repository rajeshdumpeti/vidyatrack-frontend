import { StickyNote } from "lucide-react";

import type { ParentStudent } from "../types/teacherCommunications.types";
import type { StudentNoteDto } from "@/types/studentNotes.types";
import { StudentNoteComposerCard } from "./StudentNoteComposerCard";
import { StudentNotesTimelineCard } from "./StudentNotesTimelineCard";
import { StudentNoteSelector } from "./StudentNoteSelector";

type StudentNotesTabPanelProps = {
  noteSearchRef: React.RefObject<HTMLDivElement | null>;
  noteStudentSearch: string;
  setNoteStudentSearch: (value: string) => void;
  isNoteSearchOpen: boolean;
  setIsNoteSearchOpen: (open: boolean) => void;
  filteredNoteStudents: ParentStudent[];
  totalStudents: number;
  studentsLoading: boolean;
  onSelectStudent: (student: ParentStudent) => void;
  selectedStudent: ParentStudent | undefined;
  noteText: string;
  setNoteText: (value: string) => void;
  noteError: string | null;
  noteSuccess: string | null;
  onSaveNote: () => Promise<void>;
  isSavingNote: boolean;
  studentId: string;
  notes: StudentNoteDto[];
  isLoadingNotes: boolean;
};

export function StudentNotesTabPanel({
  noteSearchRef,
  noteStudentSearch,
  setNoteStudentSearch,
  isNoteSearchOpen,
  setIsNoteSearchOpen,
  filteredNoteStudents,
  totalStudents,
  studentsLoading,
  onSelectStudent,
  selectedStudent,
  noteText,
  setNoteText,
  noteError,
  noteSuccess,
  onSaveNote,
  isSavingNote,
  studentId,
  notes,
  isLoadingNotes,
}: StudentNotesTabPanelProps) {
  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <StickyNote className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Student Notes</h2>
          <p className="text-sm text-gray-500">
            Private notes for assigned teachers only.
          </p>
        </div>
      </div>

      <StudentNoteSelector
        noteSearchRef={noteSearchRef}
        noteStudentSearch={noteStudentSearch}
        setNoteStudentSearch={setNoteStudentSearch}
        isNoteSearchOpen={isNoteSearchOpen}
        setIsNoteSearchOpen={setIsNoteSearchOpen}
        filteredNoteStudents={filteredNoteStudents}
        totalStudents={totalStudents}
        studentsLoading={studentsLoading}
        onSelectStudent={onSelectStudent}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StudentNoteComposerCard
          selectedStudent={selectedStudent}
          noteText={noteText}
          setNoteText={setNoteText}
          noteError={noteError}
          noteSuccess={noteSuccess}
          onSaveNote={onSaveNote}
          isSavingNote={isSavingNote}
          studentId={studentId}
        />
        <StudentNotesTimelineCard
          selectedStudent={selectedStudent}
          studentId={studentId}
          notes={notes}
          isLoadingNotes={isLoadingNotes}
        />
      </div>
    </div>
  );
}
