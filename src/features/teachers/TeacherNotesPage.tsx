import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useTeacherAttendanceSection } from "@/hooks/useTeacherAttendanceSection";
import { useStudentsBySection } from "@/hooks/useStudentsBySection";
import { createStudentNote, getStudentNotes } from "@/api/studentNotes.api";
import { logger } from "@/utils/logger";
import { format } from "date-fns";

interface StudentNote {
  id: number;
  school_id: number;
  student_id: number;
  author_user_id: number;
  author_name: string;
  author_role: string;
  note_text: string;
  created_at: string;
}

export function TeacherNotesPage() {
  const navigate = useNavigate();
  const trace = useMemo(() => logger.traceId(), []);
  const [studentId, setStudentId] = useState<string>("");
  const [noteText, setNoteText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "view">("write");

  const section = useTeacherAttendanceSection();
  const sectionId = section.data?.section_id;
  const studentsQuery = useStudentsBySection(sectionId);

  // Fetch notes when student changes or after saving a new note
  useEffect(() => {
    if (!studentId) {
      setNotes([]);
      return;
    }
    if (activeTab !== "view") return;
    fetchNotes();
  }, [studentId, activeTab]);

  const fetchNotes = async () => {
    if (!studentId) return;

    setIsLoadingNotes(true);
    try {
      const response = await getStudentNotes(Number(studentId));
      setNotes(
        (response || []).map((note: any) => ({
          ...note,
          author_user_id: note.author_user_id ?? 0, // fallback to 0 if null
        })),
      );
    } catch (err) {
      logger.warn("[teacher][notes] fetch_failed", { trace, err });
      setError("Unable to fetch notes. Please try again.");
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const onSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!studentId || !noteText.trim()) return;

    try {
      setIsSaving(true);
      await createStudentNote(Number(studentId), {
        note_text: noteText.trim(),
      });
      setSuccess("Note saved successfully.");
      setNoteText("");

      // Refresh notes after saving
      await fetchNotes();

      logger.info("[teacher][notes] create_success", { trace, studentId });
    } catch (err) {
      logger.warn("[teacher][notes] create_failed", { trace, err });
      setError("Unable to save note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStudentChange = (value: string) => {
    setStudentId(value);
    setError(null);
    setSuccess(null);
  };

  const selectedStudent = studentsQuery.data?.find(
    (s) => s.id.toString() === studentId,
  );
  const formattedDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return dateString;
    }
  };

  if (section.isLoading) {
    return <LoadingState label="Loading your section..." />;
  }

  if (section.error || !sectionId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto w-full max-w-2xl">
          <ErrorState
            title="No attendance section assigned"
            message="Please contact management to assign your attendance section."
          />
          <button
            type="button"
            onClick={() => section.refetch()}
            className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-sm font-semibold text-blue-600"
            onClick={() => navigate("/teacher")}
          >
            ← Back
          </button>
          <div className="text-base font-bold text-gray-900 tracking-tight">
            Student Notes
          </div>
          <div />
        </div>

        {/* Modern Toggle */}
        <div className="mt-6 flex items-center justify-center">
          <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                activeTab === "write"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("write")}
            >
              Write Note
            </button>
            <button
              type="button"
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                activeTab === "view"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("view")}
            >
              View Notes
            </button>
          </div>
        </div>

        {/* Student Selector */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select Student
            </label>
            <select
              className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              value={studentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              disabled={studentsQuery.isLoading}
            >
              <option value="">Select a student...</option>
              {(studentsQuery.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.roll_no ? `(#${s.roll_no})` : ""}
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="mb-2 text-sm text-gray-600">
              Viewing notes for{" "}
              <span className="font-semibold text-gray-900">
                {selectedStudent.name}
              </span>
            </div>
          )}
        </div>

        {/* Write Note Section */}
        {activeTab === "write" ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-100 p-2">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    New Note
                  </h3>
                  <p className="text-sm text-gray-600">
                    Record observations for{" "}
                    {selectedStudent?.name || "selected student"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Note Content
                </label>
                <textarea
                  className="w-full rounded-xl border border-gray-200 bg-white p-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-32"
                  placeholder="e.g., Sarah showed great improvement in math today..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  maxLength={200}
                  disabled={!studentId}
                />
                <div className="mt-2 flex justify-between">
                  <div className="text-xs text-gray-500">
                    Write clear, specific notes about student progress
                  </div>
                  <div className="text-xs text-gray-500">
                    {noteText.length}/200 characters
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-red-800">
                      {error}
                    </span>
                  </div>
                </div>
              ) : null}

              {success ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-green-800">
                      {success}
                    </span>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-blue-800 disabled:opacity-60"
                onClick={onSubmit}
                disabled={isSaving || !studentId || !noteText.trim()}
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Note"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-gray-100 p-2">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Student Notes
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedStudent
                        ? `All notes for ${selectedStudent.name}`
                        : "Select a student to view notes"}
                    </p>
                  </div>
                </div>
                {notes.length > 0 && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {notes.length} {notes.length === 1 ? "note" : "notes"}
                  </span>
                )}
              </div>
            </div>

            {!studentId ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  No student selected
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Select a student from the dropdown above to view their notes
                </p>
              </div>
            ) : isLoadingNotes ? (
              <div className="py-12 text-center">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-sm text-gray-500">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  No notes yet
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Start documenting this student's progress
                </p>
                <button
                  type="button"
                  className="mt-4 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  onClick={() => setActiveTab("write")}
                >
                  Write First Note
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-blue-50">
                          <span className="text-sm font-semibold text-blue-600">
                            {note.author_name?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {note.author_name || "Unknown"}
                            {note.author_role && (
                              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-600">
                                {note.author_role}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formattedDate(note.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {note.note_text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
