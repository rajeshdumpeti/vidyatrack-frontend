import type { StudentNoteDto } from "@/types/studentNotes.types";

import type { ParentStudent } from "../types/teacherCommunications.types";
import { formatCommunicationsDate } from "../utils/teacherCommunications.utils";

type StudentNotesTimelineCardProps = {
  selectedStudent: ParentStudent | undefined;
  studentId: string;
  notes: StudentNoteDto[];
  isLoadingNotes: boolean;
};

export function StudentNotesTimelineCard({
  selectedStudent,
  studentId,
  notes,
  isLoadingNotes,
}: StudentNotesTimelineCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Notes Timeline</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedStudent
              ? `History for ${selectedStudent.name}`
              : "Select a student to view notes"}
          </p>
        </div>
        {notes.length > 0 ? (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {notes.length} notes
          </span>
        ) : null}
      </div>

      {!studentId ? (
        <div className="py-10 text-center text-sm text-gray-500">
          Choose a student to view notes.
        </div>
      ) : isLoadingNotes ? (
        <div className="py-10 text-center text-sm text-gray-500">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          No notes yet for this student.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">
                  {note.author_name || "Unknown"}
                  {note.author_role ? (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {note.author_role}
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-gray-500">
                  {formatCommunicationsDate(note.created_at)}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
                {note.note_text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
