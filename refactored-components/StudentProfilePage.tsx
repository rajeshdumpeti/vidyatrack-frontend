import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { apiClient } from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import { logger } from "@/utils/logger";
import type { StudentDto } from "@/types/student.types";
import { useStudentNotes, useCreateStudentNote } from "@/hooks/useStudentNotes";
import {
  User,
  Phone,
  Hash,
  BookOpen,
  MessageSquare,
  Calendar,
  Clock,
  Plus,
  CheckCircle,
  Loader2,
} from "lucide-react";

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
        setNoteSuccess("Note added successfully");
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Student Profile Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {studentQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                <p className="mt-2 text-sm text-gray-600">
                  Loading student profile...
                </p>
              </div>
            </div>
          ) : studentQuery.error ? (
            <ErrorState
              title="Student not found"
              message="Unable to load student profile."
            />
          ) : (
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
              {/* Student Avatar/Initial */}
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <span className="text-3xl font-bold text-white">
                  {studentQuery.data!.name.charAt(0)}
                </span>
              </div>

              {/* Student Info */}
              <div className="flex-1">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {studentQuery.data!.name}
                  </h1>
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1">
                    <Hash className="h-3 w-3 text-blue-700" />
                    <span className="text-sm font-medium text-blue-800">
                      ID: {studentQuery.data!.id}
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <Hash className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Roll No
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {studentQuery.data!.roll_no ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Class / Section
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {buildClassSectionLabel(studentQuery.data!)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                      <Phone className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Parent Phone
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {studentQuery.data!.parent_phone ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                      <User className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Student ID
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {studentQuery.data!.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          {/* Section Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Student Notes
                </h2>
                <p className="text-sm text-gray-600">
                  Append-only timeline for observations
                </p>
              </div>
            </div>
            {notes.data && notes.data.length > 0 && (
              <div className="rounded-full bg-gray-100 px-3 py-1">
                <span className="text-sm font-medium text-gray-700">
                  {notes.data.length} note{notes.data.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Notes Timeline */}
          <div className="space-y-6">
            {notes.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Loading notes...</p>
                </div>
              </div>
            ) : notes.error ? (
              <ErrorState
                title="Unable to load notes"
                message="Please try again later."
              />
            ) : (notes.data?.length ?? 0) === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-3 text-sm font-medium text-gray-600">
                  No notes yet. Add the first note below.
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

                {notes.data!.map((n, index) => (
                  <div key={n.id} className="relative flex gap-4 pb-6">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          index === 0 ? "bg-blue-500" : "bg-gray-400"
                        }`}
                      />
                    </div>

                    {/* Note card */}
                    <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {n.note_text}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>
                          {new Date(n.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Note Form */}
          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Note
              </h3>
            </div>

            <textarea
              className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              rows={4}
              placeholder="Write your observation about the student..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              disabled={createNote.isPending}
            />

            {noteSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  {noteSuccess}
                </p>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onAddNote}
                disabled={createNote.isPending || noteText.trim().length === 0}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createNote.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Note
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
