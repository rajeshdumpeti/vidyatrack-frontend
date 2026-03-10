import { Search } from "lucide-react";

import type { ParentStudent } from "../types/teacherCommunications.types";

type StudentNoteSelectorProps = {
  noteSearchRef: React.RefObject<HTMLDivElement | null>;
  noteStudentSearch: string;
  setNoteStudentSearch: (value: string) => void;
  isNoteSearchOpen: boolean;
  setIsNoteSearchOpen: (open: boolean) => void;
  filteredNoteStudents: ParentStudent[];
  totalStudents: number;
  studentsLoading: boolean;
  onSelectStudent: (student: ParentStudent) => void;
};

export function StudentNoteSelector({
  noteSearchRef,
  noteStudentSearch,
  setNoteStudentSearch,
  isNoteSearchOpen,
  setIsNoteSearchOpen,
  filteredNoteStudents,
  totalStudents,
  studentsLoading,
  onSelectStudent,
}: StudentNoteSelectorProps) {
  return (
    <div className="mt-6">
      <label className="block text-sm font-semibold text-gray-900">
        Select Student
      </label>
      <div className="relative mt-3" ref={noteSearchRef}>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={noteStudentSearch}
            onFocus={() => setIsNoteSearchOpen(true)}
            onChange={(event) => {
              setNoteStudentSearch(event.target.value);
              setIsNoteSearchOpen(true);
            }}
            placeholder="Search student by name or roll..."
            className="h-8 w-full bg-transparent text-sm font-medium text-gray-700 outline-none placeholder:text-gray-400"
            disabled={studentsLoading}
          />
        </div>
        {isNoteSearchOpen ? (
          <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
            {filteredNoteStudents.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No students found.</div>
            ) : (
              filteredNoteStudents.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => onSelectStudent(student)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                >
                  <span className="text-sm font-semibold text-gray-900">
                    {student.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {student.roll_no ? `#${student.roll_no}` : ""}
                  </span>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Showing {filteredNoteStudents.length} of {totalStudents} students
      </p>
    </div>
  );
}
