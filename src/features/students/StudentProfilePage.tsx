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
import { Calendar, User, MessageSquare, Send } from "lucide-react";

function buildClassSectionLabel(s: StudentDto): string {
  const classPart =
    s.class_name ?? (s.class_id ? `Class #${s.class_id}` : null);
  const sectionPart =
    s.section_name ?? (s.section_id ? `Section #${s.section_id}` : null);

  if (classPart && sectionPart) return `${classPart} - ${sectionPart}`;
  if (sectionPart) return sectionPart;
  return "—";
}

// Helper to get formatted date in Indian format
function formatDateForParents(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
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
        setNoteSuccess(
          "Note added successfully! Parents can now see this message."
        );
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-6">
        {/* Header card - Enhanced for parent readability */}
        {studentQuery.isLoading ? (
          <LoadingState label="Loading student information..." />
        ) : studentQuery.error ? (
          <ErrorState
            title="Student not found"
            message="Unable to load student profile. Please check the student ID."
          />
        ) : (
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {studentQuery.data!.name}
                </div>
                <div className="text-sm text-gray-600">
                  Student Profile for Parents
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Roll Number
                </div>
                <div className="mt-2 text-lg font-bold text-gray-900">
                  {studentQuery.data!.roll_no
                    ? `#${studentQuery.data!.roll_no}`
                    : "—"}
                </div>
              </div>

              <div className="rounded-xl bg-green-50 p-4 border border-green-100">
                <div className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                  Class & Section
                </div>
                <div className="mt-2 text-lg font-bold text-gray-900">
                  {buildClassSectionLabel(studentQuery.data!)}
                </div>
              </div>

              <div className="rounded-xl bg-yellow-50 p-4 border border-yellow-100">
                <div className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">
                  Parent Contact
                </div>
                <div className="mt-2 text-lg font-bold text-gray-900">
                  {studentQuery.data!.parent_phone
                    ? `+91 ${studentQuery.data!.parent_phone}`
                    : "—"}
                </div>
              </div>

              <div className="rounded-xl bg-purple-50 p-4 border border-purple-100">
                <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                  Student ID
                </div>
                <div className="mt-2 text-lg font-bold text-gray-900">
                  {studentQuery.data!.id}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Parent Communication Card - Enhanced for readability */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  📝 Parent Communication
                </div>
                <div className="text-sm text-gray-600">
                  Messages from school to parents. Only school can add messages.
                </div>
              </div>
            </div>
          </div>

          {/* Instructions for parents */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="text-sm font-semibold text-blue-900 mb-2">
              📢 Information for Parents:
            </div>
            <ul className="text-sm text-blue-800 space-y-1 list-disc pl-5">
              <li>All messages are from school to parents</li>
              <li>Parents can only read messages, cannot reply here</li>
              <li>Messages include important updates about your child</li>
              <li>Contact school office for any questions</li>
            </ul>
          </div>

          {/* Notes Timeline */}
          <div className="space-y-4">
            {notes.isLoading ? (
              <LoadingState label="Loading messages..." />
            ) : notes.error ? (
              <ErrorState
                title="Unable to load messages"
                message="Please refresh the page or try again later."
              />
            ) : (notes.data?.length ?? 0) === 0 ? (
              <EmptyState
                message="No messages yet. School will add messages here when needed."
                icon={<MessageSquare className="w-12 h-12 text-gray-400" />}
              />
            ) : (
              <div className="space-y-4">
                <div className="text-sm font-semibold text-gray-700 px-2">
                  📋 Total Messages: {notes.data!.length}
                </div>
                <div className="relative pl-8 border-l-2 border-blue-200 space-y-6">
                  {notes.data!.map((n, index) => (
                    <div key={n.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[33px] top-0 w-6 h-6 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center">
                        <div className="text-xs font-bold text-white">
                          {notes.data!.length - index}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-all duration-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-blue-100 rounded">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                Message from School
                              </div>
                              <div className="text-xs text-gray-500">
                                Sent by: Teacher/Administrator
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDateForParents(new Date(n.created_at))}
                            </span>
                          </div>
                        </div>

                        <div className="text-gray-800 whitespace-pre-wrap bg-white p-3 rounded-lg border border-gray-100">
                          {n.note_text}
                        </div>

                        <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                          <div className="px-2 py-1 bg-gray-100 rounded">
                            Message #{n.id}
                          </div>
                          <div className="px-2 py-1 bg-gray-100 rounded">
                            Student ID: {studentId}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add Note Section - For School Use Only */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-sm font-semibold text-yellow-800">
                ⚠️ For School Staff Only:
              </div>
              <div className="text-sm text-yellow-700">
                This section is only for school to send messages to parents.
                Parents cannot send messages here.
              </div>
            </div>

            <label className="block text-sm font-bold text-gray-900 mb-2">
              Write Message to Parents:
            </label>

            <textarea
              className="mt-2 w-full rounded-xl border border-gray-300 p-4 text-base focus:ring-3 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
              rows={5}
              placeholder="Type your message to parents here...\n\nExamples:\n• Your child did well in today's test\n• School event on Friday\n• Parent-teacher meeting reminder\n• Fee payment due date"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              disabled={createNote.isPending}
            />

            <div className="mt-2 text-sm text-gray-500">
              Write clear messages. Parents will read this message exactly as
              written.
            </div>

            {createNote.isError ? (
              <div className="mt-3">
                <ErrorState
                  title="Unable to send message"
                  message="Please check your connection and try again."
                />
              </div>
            ) : null}

            {noteSuccess ? (
              <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div className="text-sm font-semibold text-green-800">
                    ✓ {noteSuccess}
                  </div>
                </div>
                <div className="mt-1 text-sm text-green-700">
                  Message has been sent to parents successfully.
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={onAddNote}
              disabled={createNote.isPending || noteText.trim().length === 0}
              className={[
                "mt-4 h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 text-base font-bold text-white",
                "hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60",
                "flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200",
              ].join(" ")}
            >
              {createNote.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message to Parents
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
