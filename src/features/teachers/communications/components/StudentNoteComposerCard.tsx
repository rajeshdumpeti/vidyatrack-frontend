import type { ParentStudent } from "../types/teacherCommunications.types";

type StudentNoteComposerCardProps = {
  selectedStudent: ParentStudent | undefined;
  noteText: string;
  setNoteText: (value: string) => void;
  noteError: string | null;
  noteSuccess: string | null;
  onSaveNote: () => Promise<void>;
  isSavingNote: boolean;
  studentId: string;
};

export function StudentNoteComposerCard({
  selectedStudent,
  noteText,
  setNoteText,
  noteError,
  noteSuccess,
  onSaveNote,
  isSavingNote,
  studentId,
}: StudentNoteComposerCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-base font-semibold text-gray-900">New Note</h3>
      <p className="mt-1 text-sm text-gray-500">
        {selectedStudent
          ? `Record observations for ${selectedStudent.name}`
          : "Choose a student to begin"}
      </p>
      <textarea
        className="mt-4 h-32 w-full rounded-xl border border-gray-200 bg-white p-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        placeholder="e.g., Shows strong participation in class discussions..."
        value={noteText}
        onChange={(event) => setNoteText(event.target.value)}
        maxLength={200}
        disabled={!studentId}
      />
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{noteText.length}/200 characters</span>
        <span>Only visible to assigned teachers</span>
      </div>
      {noteError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {noteError}
        </div>
      ) : null}
      {noteSuccess ? (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {noteSuccess}
        </div>
      ) : null}
      <button
        type="button"
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-blue-800 disabled:opacity-60"
        onClick={() => {
          void onSaveNote();
        }}
        disabled={isSavingNote || !studentId || !noteText.trim()}
      >
        {isSavingNote ? "Saving..." : "Save Note"}
      </button>
    </div>
  );
}
