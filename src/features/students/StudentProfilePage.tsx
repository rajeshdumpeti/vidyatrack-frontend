import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { logger } from "@/utils/logger";
import { getStudentProfile } from "@/api/students.api";
import { useStudentNotes } from "@/hooks/useStudentNotes";
import type {
  StudentAttendanceSummary,
  StudentGuardian,
  StudentPersonalDetails,
  StudentProfileDto,
  StudentRecentResult,
} from "@/types/student.types";
import type { StudentNoteDto } from "@/types/studentNotes.types";

function humanizeDate(iso: string): string {
  const input = new Date(iso);
  if (Number.isNaN(input.getTime())) return "—";
  const diffMs = Date.now() - input.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay} days ago`;
  return input.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatValue(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function formatDob(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPercent(value?: number | null): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${Math.round(value)}%`;
}

function getStatusClasses(status?: string | null): string {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "active") return "bg-green-50 text-green-700";
  if (normalized === "inactive") return "bg-gray-100 text-gray-600";
  return "bg-blue-50 text-blue-700";
}

export function StudentProfilePage() {
  const trace = useMemo(() => logger.traceId(), []);
  const params = useParams();
  const studentId = Number(params.studentId);

  const studentQuery = useQuery({
    queryKey: ["student", studentId],
    enabled: Number.isFinite(studentId) && studentId > 0,
    retry: 1,
    queryFn: () => getStudentProfile(studentId),
  });

  const notesQuery = useStudentNotes(studentId);

  if (!Number.isFinite(studentId) || studentId <= 0) {
    return (
      <div className="px-4 py-6">
        <ErrorState title="Student not found" message="Invalid student ID." />
      </div>
    );
  }

  if (studentQuery.isLoading) {
    return <LoadingState label="Loading student information..." />;
  }

  if (studentQuery.error || !studentQuery.data) {
    return (
      <div className="px-4 py-6">
        <ErrorState
          title="Student not found"
          message="Unable to load student profile. Please check the student ID."
        />
      </div>
    );
  }

  const student = studentQuery.data as StudentProfileDto;
  const personal = student.personal_details as StudentPersonalDetails | null;
  const guardians = (student.guardians ?? []) as StudentGuardian[];
  const attendance = student.attendance as StudentAttendanceSummary | null;
  const recentResults = (student.recent_results ?? []) as StudentRecentResult[];
  const notes = (notesQuery.data ?? []) as StudentNoteDto[];

  const headerClassSection =
    student.class_name && student.section_name
      ? `${student.class_name} - ${student.section_name}`
      : student.class_name || student.section_name || "—";

  logger.info("[student-profile] loaded", { trace, studentId });

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-blue-600">
                {student.name?.slice(0, 1) ?? "S"}
              </div>
              <div>
                <div className="text-2xl font-extrabold text-gray-900">
                  {formatValue(student.name)}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <span>Student Code: {formatValue(student.student_code)}</span>
                  <span>•</span>
                  <span>{headerClassSection}</span>
                  <span>•</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                      student.status
                    )}`}
                  >
                    {formatValue(student.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-gray-900">
              Personal Details
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-700">
              <div>
                <div className="text-xs font-semibold text-gray-500">
                  Date of Birth
                </div>
                <div className="mt-1 font-semibold text-gray-900">
                  {formatDob(personal?.date_of_birth ?? null)}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500">
                  Gender
                </div>
                <div className="mt-1 font-semibold text-gray-900">
                  {formatValue(personal?.gender)}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500">
                  Blood Group
                </div>
                <div className="mt-1 font-semibold text-gray-900">
                  {formatValue(personal?.blood_group)}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500">
                  Religion
                </div>
                <div className="mt-1 font-semibold text-gray-900">
                  {formatValue(personal?.religion)}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500">
                  Address
                </div>
                <div className="mt-1 font-semibold text-gray-900">
                  {formatValue(personal?.address)}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-gray-900">Attendance</div>
              <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                {formatPercent(attendance?.percentage)}
              </span>
            </div>
            <div className="mt-4 text-3xl font-extrabold text-gray-900">
              {formatPercent(attendance?.percentage)}
            </div>
            <div className="mt-1 text-sm text-gray-500">Year to Date</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-xs font-semibold text-gray-500">
                  Present Days
                </div>
                <div className="mt-1 text-base font-semibold text-gray-900">
                  {formatValue(attendance?.present_days)}
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-xs font-semibold text-gray-500">
                  Absent Days
                </div>
                <div className="mt-1 text-base font-semibold text-gray-900">
                  {formatValue(attendance?.absent_days)}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-gray-900">
              Recent Results
            </div>
            <div className="mt-4 space-y-3">
              {recentResults.length === 0 ? (
                <EmptyState message="No recent results." />
              ) : (
                recentResults.map((r, idx) => (
                  <div
                    key={`${r.subject_name ?? "subject"}-${idx}`}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="text-sm font-semibold text-gray-900">
                      {formatValue(r.subject_name)}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatValue(r.exam_type)}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-blue-600">
                      {formatValue(r.marks_obtained)}/
                      {formatValue(r.max_marks)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_2fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-gray-900">
              Guardian Contact
            </div>
            <div className="mt-4 space-y-3">
              {guardians.length === 0 ? (
                <EmptyState message="No guardians listed." />
              ) : (
                guardians.map((g, idx) => (
                  <div
                    key={`${g.name ?? "guardian"}-${idx}`}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="text-sm font-semibold text-gray-900">
                      {formatValue(g.name)}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatValue(g.relation)}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-gray-900">
                      {formatValue(g.phone)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-gray-900">Teacher Notes</div>
            <div className="mt-4 space-y-4">
              {notesQuery.isLoading ? (
                <LoadingState label="Loading notes..." />
              ) : notesQuery.error ? (
                <ErrorState
                  title="Unable to load notes"
                  message="Please try again later."
                />
              ) : notes.length === 0 ? (
                <EmptyState message="No notes yet." />
              ) : (
                notes.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {formatValue(n.author_name)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatValue(n.author_role)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {humanizeDate(n.created_at)}
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-800">
                      {n.note_text}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
