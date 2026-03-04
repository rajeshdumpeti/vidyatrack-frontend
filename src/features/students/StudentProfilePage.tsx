import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { logger } from "@/utils/logger";
import { getStudentProfile, getStudentReportCard } from "@/api/students.api";
import { useStudentNotes } from "@/hooks/useStudentNotes";
import { useAuthStore } from "@/store/auth.store";
import type {
  StudentAttendanceSummary,
  StudentGuardian,
  StudentPersonalDetails,
  StudentProfileDto,
  StudentRecentResult,
  StudentReportCardDto,
} from "@/types/student.types";
import type { StudentNoteDto } from "@/types/studentNotes.types";
import {
  FileText,
  Phone,
  ShieldUser,
  UserCircle2,
} from "lucide-react";

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

function prettyExamType(value?: string | null): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "Exam";
  return raw
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusClasses(status?: string | null): string {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "active") return "bg-green-50 text-green-700";
  if (normalized === "inactive") return "bg-gray-100 text-gray-600";
  return "bg-blue-50 text-blue-700";
}

function buildReportCardHtml(report: StudentReportCardDto): string {
  const safe = (value: string | number | null | undefined) =>
    String(value ?? "—")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const rows = Array.isArray(report.rows) ? report.rows : [];
  const examBandLabel = "ACADEMIC PERFORMANCE";
  const prettyExamType = (value: string | null | undefined) =>
    String(value ?? "Exam")
      .trim()
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  const rowsHtml = rows
    .map(
      (row) => `
        <tr>
          <td>${safe(row.subject_name)}</td>
          <td>${safe(row.marks_obtained)}</td>
          <td>${safe(row.max_marks)}</td>
          <td>${safe(row.percentage)}%</td>
          <td>${safe(row.grade)}</td>
          <td>${safe(prettyExamType(row.exam_type))}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Report Card - ${safe(report.student_name)}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 24px; color: #0f172a; background: #f1f5f9; }
          .sheet { max-width: 980px; margin: 0 auto; border-radius: 16px; background: #ffffff; border: 1px solid #dbeafe; box-shadow: 0 20px 40px rgba(2, 6, 23, 0.08); overflow: hidden; }
          .header { display:flex; justify-content:space-between; align-items:flex-start; gap: 12px; padding: 18px 20px; background: linear-gradient(135deg, #0b6fc2, #1d4ed8); color: #eff6ff; }
          .title { font-size: 26px; font-weight: 800; margin: 0; color: #ffffff; }
          .meta { margin-top: 6px; font-size: 13px; color: #dbeafe; }
          .badge { display:inline-block; padding: 6px 12px; border-radius: 999px; background:#dbeafe; color:#0b4ea2; font-weight:800; font-size:12px; }
          .print-btn { border: 1px solid #bfdbfe; background:#eff6ff; color:#1e40af; border-radius: 10px; padding: 8px 12px; font-weight: 800; cursor: pointer; }
          .metrics { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; padding: 16px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
          .card { border: 1px solid #dbeafe; border-radius: 12px; padding: 12px; background: #ffffff; }
          .metrics .card:nth-child(1) { background: linear-gradient(140deg, #eff6ff, #dbeafe); border-color: #93c5fd; }
          .metrics .card:nth-child(2) { background: linear-gradient(140deg, #ecfeff, #cffafe); border-color: #67e8f9; }
          .metrics .card:nth-child(3) { background: linear-gradient(140deg, #ecfdf5, #d1fae5); border-color: #86efac; }
          .metrics .card:nth-child(4) { background: linear-gradient(140deg, #f5f3ff, #ede9fe); border-color: #c4b5fd; }
          .label { color:#64748b; font-size:11px; font-weight:700; text-transform: uppercase; letter-spacing:.05em; }
          .value { font-size:20px; font-weight:800; margin-top:6px; color:#0f172a; }
          .table-wrap { padding: 18px 20px 10px; }
          table { width:100%; border-collapse: collapse; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; }
          th, td { border:1px solid #cbd5e1; padding:10px 12px; text-align:left; font-size: 13px; }
          .exam-band th { background: #0b6fc2; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: .06em; text-align: center; }
          .head-subject { background: #0b6fc2; color:#ffffff; font-size:12px; text-transform: uppercase; letter-spacing:.04em; }
          .head-score { background: #08b450; color:#ffffff; font-size:12px; text-transform: uppercase; letter-spacing:.04em; }
          tbody tr:nth-child(odd) { background: #f8fafc; }
          tbody tr:hover { background: #eff6ff; }
          .overall-row td { font-weight: 800; background: #eef2ff; }
          .legend { margin: 10px 20px 0; border-radius: 10px; padding: 10px 12px; background: linear-gradient(90deg, #08b450, #16a34a); color: #ffffff; font-size: 13px; font-weight: 700; text-align: center; }
          .footer { margin: 14px 20px 20px; color:#64748b; font-size:12px; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
          @media print { .print-btn { display:none; } }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div>
              <h1 class="title">Student Report Card</h1>
              <div class="meta">${safe(report.student_name)} • ${safe(report.student_code)} • ${safe(report.class_name)} - ${safe(report.section_name)}</div>
            </div>
            <div>
              <div class="badge">Grade ${safe(report.overall_grade)}</div>
              <div style="margin-top:8px"><button class="print-btn" onclick="window.print()">Print</button></div>
            </div>
          </div>

          <div class="metrics">
            <div class="card"><div class="label">Overall %</div><div class="value">${safe(report.overall_percentage)}%</div></div>
            <div class="card"><div class="label">Total Marks</div><div class="value">${safe(report.total_obtained)}/${safe(report.total_max)}</div></div>
            <div class="card"><div class="label">Attendance</div><div class="value">${safe(report.attendance_percentage)}%</div></div>
            <div class="card"><div class="label">Present / Total</div><div class="value">${safe(report.present_days)}/${safe(report.total_days)}</div></div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr class="exam-band">
                  <th colspan="6">${safe(examBandLabel)}</th>
                </tr>
                <tr>
                  <th class="head-subject">Subject</th>
                  <th class="head-score">Marks Obtained</th>
                  <th class="head-score">Max Marks</th>
                  <th class="head-score">%</th>
                  <th class="head-score">Grade</th>
                  <th class="head-score">Exam Type</th>
                </tr>
              </thead>
              <tbody>${rowsHtml || `<tr><td colspan="6">No marks available</td></tr>`}</tbody>
              <tfoot>
                <tr class="overall-row">
                  <td>Overall</td>
                  <td>${safe(report.total_obtained)}</td>
                  <td>${safe(report.total_max)}</td>
                  <td>${safe(report.overall_percentage)}%</td>
                  <td>${safe(report.overall_grade)}</td>
                  <td>Combined</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="legend">A → Excellent &nbsp;&nbsp; B → Good &nbsp;&nbsp; C → Needs Support</div>

          <div class="footer">Generated on: ${safe(new Date(report.generated_at).toLocaleString())}</div>
        </div>
      </body>
    </html>
  `;
}

export function StudentProfilePage() {
  const trace = useMemo(() => logger.traceId(), []);
  const params = useParams();
  const studentId = Number(params.studentId);
  const schoolId = useAuthStore((s) => s.schoolId);
  const schools = useAuthStore((s) => s.schools);
  const effectiveSchoolId = schoolId ?? schools[0]?.id ?? null;
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const studentQuery = useQuery({
    queryKey: ["student", studentId, effectiveSchoolId ?? null],
    enabled: Number.isFinite(studentId) && studentId > 0 && !!effectiveSchoolId,
    retry: 1,
    queryFn: () => getStudentProfile(studentId, effectiveSchoolId!),
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
  const recentResultsMap = new Map<string, StudentRecentResult[]>();
  recentResults.forEach((r) => {
    const key =
      String(r.subject_name ?? "Unknown Subject").trim() || "Unknown Subject";
    const list = recentResultsMap.get(key) ?? [];
    list.push(r);
    recentResultsMap.set(key, list);
  });
  const groupedRecentResults = Array.from(recentResultsMap.entries()).map(
    ([subject, exams]) => ({
      subject,
      exams,
    }),
  );

  const headerClassSection =
    student.class_name && student.section_name
      ? `${student.class_name} - ${student.section_name}`
      : student.class_name || student.section_name || "—";

  const generateReportCard = async () => {
    if (!effectiveSchoolId) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Generating Report Card...</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
            .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; max-width: 520px; margin: 80px auto; text-align: center; }
            .title { font-size: 18px; font-weight: 700; margin: 0 0 8px; }
            .text { color: #4b5563; font-size: 14px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <p class="title">Generating report card...</p>
            <p class="text">Please wait while we prepare the printable document.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    try {
      setIsGeneratingReport(true);
      const report = await getStudentReportCard(studentId, effectiveSchoolId);
      const html = buildReportCardHtml(report);

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
    } catch {
      const fallbackRows = recentResults.map((r) => {
        const maxMarks = r.max_marks ?? 100;
        const obtained = r.marks_obtained ?? 0;
        const pct = maxMarks
          ? Number(((obtained / maxMarks) * 100).toFixed(2))
          : 0;
        return {
          subject_name: r.subject_name ?? "Subject",
          exam_type: r.exam_type ?? "Exam",
          marks_obtained: obtained,
          max_marks: maxMarks,
          percentage: pct,
          grade:
            pct >= 90
              ? "A+"
              : pct >= 80
                ? "A"
                : pct >= 70
                  ? "B"
                  : pct >= 35
                    ? "C"
                    : "D",
        };
      });
      const totalObtained = fallbackRows.reduce(
        (sum, row) => sum + row.marks_obtained,
        0,
      );
      const totalMax = fallbackRows.reduce(
        (sum, row) => sum + row.max_marks,
        0,
      );
      const overallPercentage = totalMax
        ? Number(((totalObtained / totalMax) * 100).toFixed(2))
        : 0;
      const fallbackReport: StudentReportCardDto = {
        student_id: studentId,
        student_name: student.name ?? "Student",
        student_code: student.student_code ?? `ST-${studentId}`,
        class_name: student.class_name ?? null,
        section_name: student.section_name ?? null,
        attendance_percentage: attendance?.percentage ?? 0,
        present_days: attendance?.present_days ?? 0,
        absent_days: attendance?.absent_days ?? 0,
        total_days:
          (attendance?.present_days ?? 0) + (attendance?.absent_days ?? 0),
        total_obtained: totalObtained,
        total_max: totalMax,
        overall_percentage: overallPercentage,
        overall_grade:
          overallPercentage >= 90
            ? "A+"
            : overallPercentage >= 80
              ? "A"
              : overallPercentage >= 70
                ? "B"
                : overallPercentage >= 35
                  ? "C"
                  : "D",
        generated_at: new Date().toISOString(),
        rows: fallbackRows,
      };
      const html = buildReportCardHtml(fallbackReport);
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } finally {
      setIsGeneratingReport(false);
    }
  };

  logger.info("[student-profile] loaded", { trace, studentId });

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-2 space-y-6">
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
                      student.status,
                    )}`}
                  >
                    {formatValue(student.status)}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={generateReportCard}
              disabled={isGeneratingReport || !effectiveSchoolId}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <FileText className="h-4 w-4" />
              {isGeneratingReport ? "Generating..." : "Generate Report Card"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-gray-900">
              <UserCircle2 className="mr-2 inline h-4 w-4 text-slate-600" />
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
              <div className="text-sm font-bold text-gray-900">
                <ShieldUser className="mr-2 inline h-4 w-4 text-slate-600" />
                Attendance
              </div>
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
              {groupedRecentResults.length === 0 ? (
                <EmptyState message="No recent results." />
              ) : (
                groupedRecentResults.map((group, idx) => (
                  <div
                    key={`${group.subject}-${idx}`}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="text-sm font-semibold text-gray-900">
                      {formatValue(group.subject)}
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {group.exams.map((exam, examIdx) => (
                        <div
                          key={`${group.subject}-${exam.exam_type ?? "exam"}-${examIdx}`}
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-2.5 py-2"
                        >
                          <span className="text-xs font-semibold text-gray-600">
                            {prettyExamType(exam.exam_type)}
                          </span>
                          <span className="text-sm font-semibold text-blue-600">
                            {formatValue(exam.marks_obtained)}/
                            {formatValue(exam.max_marks)}
                          </span>
                        </div>
                      ))}
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
              <Phone className="mr-2 inline h-4 w-4 text-slate-600" />
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
                      {g.phone ? (
                        <a
                          href={`tel:${g.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 hover:text-blue-800 hover:underline"
                        >
                          {g.phone}
                        </a>
                      ) : (
                        formatValue(g.phone)
                      )}
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
                        {n.class_name || n.section_name || n.subject_name ? (
                          <div className="mt-1 text-xs font-medium text-blue-700">
                            Class: {formatValue(n.class_name)} • Section:{" "}
                            {formatValue(n.section_name)} • Subject:{" "}
                            {formatValue(n.subject_name)}
                          </div>
                        ) : null}
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
