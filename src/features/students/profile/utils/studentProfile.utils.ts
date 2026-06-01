import { prettyExamType } from "@/utils/exams";
import type { StudentReportCardDto } from "@/types/student.types";

export function humanizeDate(iso: string): string {
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

export function formatValue(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export function formatDob(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatPercent(value?: number | null): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${Math.round(value)}%`;
}

export function getStatusClasses(status?: string | null): string {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "active") return "bg-green-50 text-green-700";
  if (normalized === "inactive") return "bg-gray-100 text-gray-600";
  return "bg-blue-50 text-blue-700";
}

export function buildReportCardHtml(report: StudentReportCardDto): string {
  const safe = (value: string | number | null | undefined) =>
    String(value ?? "—")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const rows = Array.isArray(report.rows) ? report.rows : [];
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

  const schoolLine = [report.school_name, report.school_address].filter(Boolean).join(" • ");
  const academicYearLine = report.academic_year ? `Academic Year: ${safe(report.academic_year)}` : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Report Card - ${safe(report.student_name)}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 24px; color: #0f172a; background: #f1f5f9; }
          .sheet { max-width: 980px; margin: 0 auto; border-radius: 16px; background: #ffffff; border: 1px solid #dbeafe; box-shadow: 0 20px 40px rgba(2, 6, 23, 0.08); overflow: hidden; }
          .school-header { text-align: center; padding: 18px 20px 14px; border-bottom: 2px solid #1d4ed8; background: #ffffff; }
          .school-name { font-size: 22px; font-weight: 900; color: #1e3a8a; margin: 0 0 4px; letter-spacing: .01em; }
          .school-sub { font-size: 12px; color: #475569; margin: 0 0 2px; }
          .school-year { font-size: 12px; font-weight: 700; color: #1d4ed8; margin: 4px 0 0; }
          .header { display:flex; justify-content:space-between; align-items:flex-start; gap: 12px; padding: 14px 20px; background: linear-gradient(135deg, #0b6fc2, #1d4ed8); color: #eff6ff; }
          .title { font-size: 20px; font-weight: 800; margin: 0; color: #ffffff; }
          .meta { margin-top: 4px; font-size: 12px; color: #dbeafe; }
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
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin: 20px 20px 0; padding: 18px 0 0; border-top: 1px solid #e2e8f0; }
          .sig-block { text-align: center; }
          .sig-line { border-bottom: 1px solid #334155; margin: 0 20px 6px; height: 32px; }
          .sig-label { font-size: 12px; font-weight: 600; color: #475569; }
          .footer { margin: 14px 20px 20px; color:#64748b; font-size:12px; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
          @media print { .print-btn { display:none; } }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="school-header">
            <div class="school-name">${schoolLine ? safe(schoolLine) : "VidyaTrack School"}</div>
            ${academicYearLine ? `<div class="school-year">${safe(academicYearLine)}</div>` : ""}
          </div>

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
                  <th colspan="6">ACADEMIC PERFORMANCE</th>
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

          <div class="legend">A+ / A → Excellent &nbsp;&nbsp; B+ / B → Good &nbsp;&nbsp; C → Average &nbsp;&nbsp; D → Needs Support &nbsp;&nbsp; F → Fail</div>

          <div class="signatures">
            <div class="sig-block">
              <div class="sig-line"></div>
              <div class="sig-label">Class Teacher Signature</div>
            </div>
            <div class="sig-block">
              <div class="sig-line"></div>
              <div class="sig-label">Principal Signature</div>
            </div>
          </div>

          <div class="footer">Generated on: ${safe(new Date(report.generated_at).toLocaleString())}</div>
        </div>
      </body>
    </html>
  `;
}

export function getReportLoadingHtml() {
  return `
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
  `;
}
