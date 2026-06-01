import { useQuery } from "@tanstack/react-query";
import { BarChart3, CalendarCheck2, Download, IndianRupee, UserCog2 } from "lucide-react";

import { API_ENDPOINTS } from "@/api/endpoints";
import { getManagementReports } from "@/api/managementReports.api";
import { useAuthStore } from "@/store/auth.store";

function formatINR(value: number) {
  return `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
}

export function ManagementReportsPage() {
  const schoolId = useAuthStore((state) => state.schoolId);
  const query = useQuery({
    queryKey: ["management-reports", schoolId],
    queryFn: () => getManagementReports(schoolId!),
    enabled: Boolean(schoolId),
  });

  const data = query.data?.data;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Reports
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              Management reports
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Attendance, exam performance, fee collection, and staff activity in one place.
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            Generated
            <div className="mt-1 text-sm font-semibold text-slate-700">
              {data?.generated_at ? new Date(data.generated_at).toLocaleString() : "-"}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-black text-slate-900">Attendance Report</h2>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-3 pr-4">Class</th>
                  <th className="pb-3 pr-4">Present</th>
                  <th className="pb-3 pr-4">Absent</th>
                  <th className="pb-3">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {(data?.attendance_report ?? []).map((row) => (
                  <tr key={row.class_name} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-semibold text-slate-900">{row.class_name}</td>
                    <td className="py-3 pr-4 text-slate-600">{row.present_count}</td>
                    <td className="py-3 pr-4 text-slate-600">{row.absent_count}</td>
                    <td className="py-3 text-slate-600">{row.attendance_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-black text-slate-900">Exam Performance Report</h2>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-3 pr-4">Subject</th>
                  <th className="pb-3 pr-4">Exam</th>
                  <th className="pb-3 pr-4">Average %</th>
                  <th className="pb-3">Pass Rate %</th>
                </tr>
              </thead>
              <tbody>
                {(data?.exam_report ?? []).map((row, index) => (
                  <tr key={`${row.subject_name}-${row.exam_type}-${index}`} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-semibold text-slate-900">{row.subject_name}</td>
                    <td className="py-3 pr-4 text-slate-600">{row.exam_type}</td>
                    <td className="py-3 pr-4 text-slate-600">{row.avg_marks_pct}%</td>
                    <td className="py-3 text-slate-600">{row.pass_rate_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-black text-slate-900">Fee Collection Report</h2>
          </div>
          <div className="mt-5 space-y-3">
            {(data?.fee_report ?? []).map((row) => (
              <div key={row.month} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">{row.month}</div>
                  <div className="text-xs text-slate-500">{row.payment_count} payments</div>
                </div>
                <div className="text-sm font-bold text-slate-900">{formatINR(row.collected_amount)}</div>
              </div>
            ))}
            <a
              href={`${API_ENDPOINTS.fees.exportCsv}?school_id=${schoolId ?? ""}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
            >
              <Download className="h-4 w-4" />
              Export fee CSV
            </a>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <UserCog2 className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-black text-slate-900">Staff Activity Report</h2>
          </div>
          <div className="mt-5 space-y-3">
            {(data?.staff_report ?? []).map((row, index) => (
              <div key={`${row.name}-${index}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">{row.name}</div>
                  <div className="text-xs capitalize text-slate-500">{row.role}</div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold capitalize text-emerald-700">
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
