import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useTeacherAttendanceSection } from "@/hooks/useTeacherAttendanceSection";
import { useStudentsBySection } from "@/hooks/useStudentsBySection";
import { createStudentNote } from "@/api/studentNotes.api";
import { logger } from "@/utils/logger";

export function TeacherNotesPage() {
  const navigate = useNavigate();
  const trace = useMemo(() => logger.traceId(), []);
  const [studentId, setStudentId] = useState<string>("");
  const [noteText, setNoteText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const section = useTeacherAttendanceSection();
  const sectionId = section.data?.section_id;
  const studentsQuery = useStudentsBySection(sectionId);

  const onSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!studentId || !noteText.trim()) return;

    try {
      setIsSaving(true);
      await createStudentNote(Number(studentId), { note_text: noteText.trim() });
      setSuccess("Note saved successfully.");
      setNoteText("");
      setStudentId("");
      logger.info("[teacher][notes] create_success", { trace, studentId });
    } catch (err) {
      logger.warn("[teacher][notes] create_failed", { trace, err });
      setError("Unable to save note. Please try again.");
    } finally {
      setIsSaving(false);
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
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-sm font-semibold text-gray-600 hover:text-gray-900"
            onClick={() => navigate("/teacher")}
          >
            ← Back
          </button>
          <div className="text-sm font-semibold text-gray-700">
            Write Student Note
          </div>
          <div />
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-600">
            Quickly record an observation for a student to track their progress.
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900">
                Student Name
              </label>
              <select
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
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

            <div>
              <label className="block text-sm font-semibold text-gray-900">
                Note Content
              </label>
              <textarea
                className="mt-2 h-40 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="e.g., Sarah showed great improvement in math today..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                maxLength={200}
              />
              <div className="mt-2 text-xs text-gray-500 text-right">
                {noteText.length}/200 characters
              </div>
            </div>

            {error ? (
              <ErrorState title="Unable to save note" message={error} />
            ) : null}

            {success ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
                {success}
              </div>
            ) : null}

            <button
              type="button"
              className="mt-2 h-12 w-full rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              onClick={onSubmit}
              disabled={isSaving || !studentId || !noteText.trim()}
            >
              {isSaving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
