import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { apiClient } from "../../api/apiClient";
import { API_ENDPOINTS } from "../../api/endpoints";
import { logger } from "../../utils/logger";
import type { StudentDto } from "../../types/student.types";
import {
  useStudentNotes,
  useCreateStudentNote,
} from "../../hooks/useStudentNotes";

function buildClassSectionLabel(s: StudentDto): string {
  const classPart =
    s.class_name ?? (s.class_id ? `Class #${s.class_id}` : null);
  const sectionPart =
    s.section_name ?? (s.section_id ? `Section #${s.section_id}` : null);

  if (classPart && sectionPart) return `${classPart} - ${sectionPart}`;
  if (sectionPart) return sectionPart;
  return "—";
}

export function StudentProfilePage() {
  const trace = useMemo(() => logger.traceId(), []);
  const params = useParams();
  const studentId = Number(params.studentId);
  const [noteText, setNoteText] = useState("");
  const [noteSuccess, setNoteSuccess] = useState<string | null>(null);

  const studentQuery = useQuery({
    queryKey: ["student", studentId],
    enabled: Number.isFinite(studentId) && studentId > 0,
    retry: 1,
    queryFn: async () => {
      // Backend only provides list API; fetch all and find.
      // Keep minimal: no joins; just pick the matching record.
      const res = await apiClient.get<StudentDto[]>(
        API_ENDPOINTS.students.list
      );
      const found = res.data.find((s) => s.id === studentId);
      if (!found) {
        const err = new Error("student_not_found");
        (err as any).code = "student_not_found";
        throw err;
      }
      return found;
    },
  });

  const notes = useStudentNotes(studentId);
  const createNote = useCreateStudentNote(studentId);

  const onAddNote = () => {
    setNoteSuccess(null);

    const text = noteText.trim();
    if (!text) return;

    createNote.mutate({ note_text: text }, {
      onSuccess: () => {
        setNoteText("");
        setNoteSuccess("Note added.");
        logger.info("[student-profile] note_created", { trace, studentId });
      },
      onError: (err: unknown) => {
        logger.error("[student-profile] note_create_failed", {
          trace,
          studentId,
          err,
        });
      },
    } as any);
  };

  if (!Number.isFinite(studentId) || studentId <= 0) {
    return (
      <div className="px-4 py-6">
        <ErrorState title="Student not found" message="Invalid student ID." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-5">
        {/* Header card */}
        {studentQuery.isLoading ? (
          <LoadingState label="Loading student..." />
        ) : studentQuery.error ? (
          <ErrorState
            title="Student not found"
            message="Unable to load student profile."
          />
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-2xl font-extrabold tracking-tight text-gray-900">
              {studentQuery.data!.name}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-xs font-semibold text-gray-500">
                  Roll No
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {studentQuery.data!.roll_no ?? "—"}
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-xs font-semibold text-gray-500">
                  Class / Section
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {buildClassSectionLabel(studentQuery.data!)}
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-xs font-semibold text-gray-500">
                  Parent Phone
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {studentQuery.data!.parent_phone ?? "—"}
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-xs font-semibold text-gray-500">
                  Student ID
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {studentQuery.data!.id}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes card (notes area only has states) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-lg font-extrabold tracking-tight text-gray-900">
            Notes
          </div>
          <div className="mt-1 text-sm font-medium text-gray-600">
            Append-only timeline.
          </div>

          <div className="mt-4 space-y-3">
            {notes.isLoading ? (
              <LoadingState label="Loading notes..." />
            ) : notes.error ? (
              <ErrorState
                title="Unable to load notes"
                message="Please try again."
              />
            ) : (notes.data?.length ?? 0) === 0 ? (
              <EmptyState message="Add the first note below." />
            ) : (
              <ul className="space-y-3">
                {notes.data!.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="text-sm font-semibold text-gray-900 whitespace-pre-wrap">
                      {n.note_text}
                    </div>
                    <div className="mt-2 text-xs font-medium text-gray-500">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add note */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-900">
              Add Note
            </label>

            <textarea
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              rows={4}
              placeholder="Write a note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              disabled={createNote.isPending}
            />

            {createNote.isError ? (
              <div className="mt-3">
                <ErrorState
                  title="Unable to add note"
                  message="Please try again."
                />
              </div>
            ) : null}

            {noteSuccess ? (
              <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">
                {noteSuccess}
              </div>
            ) : null}

            <button
              type="button"
              onClick={onAddNote}
              disabled={createNote.isPending || noteText.trim().length === 0}
              className={[
                "mt-4 h-12 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white",
                "hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60",
              ].join(" ")}
            >
              {createNote.isPending ? "Saving..." : "Add Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
