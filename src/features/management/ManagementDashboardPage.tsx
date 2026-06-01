import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BarChart3, BellRing, IndianRupee, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

import {
  getManagementAlertHistory,
  getManagementDashboard,
  postManagementAlertAction,
} from "@/api/managementDashboard.api";
import { getManagementSetupStatus } from "@/api/managementSetup.api";
import { Toast } from "@/components/feedback/Toast";
import { useAuthStore } from "@/store/auth.store";

function formatINR(value: number) {
  return `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
}

function severityClass(severity: string) {
  if (severity === "critical") return "border-rose-200 bg-rose-50 text-rose-700";
  if (severity === "warning") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
}

function getAlertActionLabel(actionType: string) {
  if (actionType === "notify_principal") return "Notify principal";
  if (actionType === "view_list") return "View collection";
  if (actionType === "open_schedule") return "Open workflow";
  return actionType.replaceAll("_", " ");
}

export function ManagementDashboardPage() {
  const queryClient = useQueryClient();
  const schoolId = useAuthStore((state) => state.schoolId);
  const schools = useAuthStore((state) => state.schools);
  const setActiveSchool = useAuthStore((state) => state.setActiveSchool);

  const dashboardQuery = useQuery({
    queryKey: ["management-dashboard", schoolId],
    queryFn: () => getManagementDashboard({ school_id: schoolId }),
    enabled: Boolean(schoolId),
  });

  const setupQuery = useQuery({
    queryKey: ["management-setup-status", schoolId],
    queryFn: () => getManagementSetupStatus(schoolId!),
    enabled: Boolean(schoolId),
  });

  const alertHistoryQuery = useQuery({
    queryKey: ["management-dashboard-alert-history", schoolId],
    queryFn: () => getManagementAlertHistory({ school_id: schoolId }),
    enabled: Boolean(schoolId),
  });

  const alertAction = useMutation({
    mutationFn: (payload: { alert_type: string; action_type: string; school_id?: number | null }) =>
      postManagementAlertAction(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["management-dashboard-alert-history", schoolId] });
      void queryClient.invalidateQueries({ queryKey: ["management-dashboard", schoolId] });
    },
  });

  const dashboard = dashboardQuery.data?.data;
  const setup = setupQuery.data;

  const kpiCards = dashboard
    ? [
        {
          label: "Total Students",
          value: String(dashboard.kpis.total_students),
          meta: `${dashboard.kpis.students_growth_pct}% vs previous month`,
          icon: Users,
        },
        {
          label: "Fee Collected (MTD)",
          value: formatINR(dashboard.kpis.fee_collected_mtd),
          meta: `${dashboard.kpis.fee_target_pct}% of target`,
          icon: IndianRupee,
        },
        {
          label: "Fee Pending",
          value: formatINR(dashboard.kpis.fee_pending),
          meta: `${dashboard.kpis.fee_overdue_days} day overdue`,
          icon: AlertTriangle,
        },
        {
          label: "Total Staff",
          value: String(dashboard.kpis.total_staff),
          meta: `${dashboard.kpis.new_joiners_this_month} active staff mapped`,
          icon: Users,
        },
        {
          label: "Avg Attendance",
          value: `${dashboard.kpis.avg_attendance_pct}%`,
          meta: dashboard.kpis.attendance_trend,
          icon: TrendingUp,
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Management Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              Business overview
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Track enrollment, collection, staffing, alerts, and school performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {schools.length > 1 ? (
              <select
                value={schoolId ?? ""}
                onChange={(e) => setActiveSchool(Number(e.target.value))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold"
              >
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            ) : null}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                Setup
              </div>
              <div className="mt-1 text-lg font-black text-emerald-900">
                {setup?.completion_pct ?? 0}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {setup && !setup.management_setup_complete ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                Setup Pending
              </div>
              <p className="mt-1 text-base font-bold text-slate-900">
                {setup.completed_steps}/{setup.total_steps} onboarding steps completed.
              </p>
            </div>
            <Link
              to="/management/setup"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
            >
              Open setup checklist
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {kpiCards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <card.icon className="h-5 w-5 text-slate-500" />
            <div className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              {card.label}
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{card.value}</div>
            <div className="mt-1 text-sm text-slate-600 capitalize">{card.meta}</div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-black text-slate-900">Fee collection analysis</h2>
          </div>
          <div className="mt-6 grid grid-cols-12 gap-2">
            {(dashboard?.fee_chart ?? []).map((item) => {
              const maxValue = Math.max(
                ...((dashboard?.fee_chart ?? []).flatMap((entry) => [entry.actual, entry.target])),
                1,
              );
              return (
                <div key={item.month} className="flex flex-col items-center gap-2">
                  <div className="flex h-44 items-end gap-1">
                    <div
                      className="w-3 rounded-t bg-slate-300"
                      style={{ height: `${(item.target / maxValue) * 100}%` }}
                    />
                    <div
                      className="w-3 rounded-t bg-indigo-600"
                      style={{ height: `${(item.actual / maxValue) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs font-semibold text-slate-500">{item.month}</div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-black text-slate-900">Pending alerts</h2>
          </div>
          <div className="mt-5 space-y-3">
            {(dashboard?.alerts ?? []).length ? (
              (dashboard?.alerts ?? []).map((alert) => (
                <div key={alert.id} className={`rounded-2xl border p-4 ${severityClass(alert.severity)}`}>
                  <div className="text-sm font-bold">{alert.title}</div>
                  <div className="mt-1 text-sm">{alert.description}</div>
                  <button
                    type="button"
                    disabled={alertAction.isPending}
                    onClick={() =>
                      alertAction.mutate({
                        alert_type: alert.type,
                        action_type: alert.action_type,
                        school_id: alert.school_id ?? schoolId,
                      })
                    }
                    className="mt-3 inline-flex items-center rounded-xl bg-white/70 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 disabled:opacity-60"
                  >
                    {getAlertActionLabel(alert.action_type)}
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                No active alerts.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">School performance matrix</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">School</th>
                  <th className="pb-3 pr-4 font-semibold">Enrollment</th>
                  <th className="pb-3 pr-4 font-semibold">Collection</th>
                  <th className="pb-3 pr-4 font-semibold">Attendance</th>
                  <th className="pb-3 font-semibold">Grade</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard?.school_matrix ?? []).map((row) => (
                  <tr key={row.school_id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-semibold text-slate-900">{row.school_name}</td>
                    <td className="py-3 pr-4 text-slate-600">{row.enrollment}</td>
                    <td className="py-3 pr-4 text-slate-600">{formatINR(row.collection)}</td>
                    <td className="py-3 pr-4 text-slate-600">{row.attendance_pct}%</td>
                    <td className="py-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        {row.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">Quarterly outlook</h2>
            <div className="mt-4 text-3xl font-black text-slate-900">
              {formatINR(dashboard?.quarterly_outlook.projected_revenue ?? 0)}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {dashboard?.quarterly_outlook.growth_forecast_pct ?? 0}% estimated growth
            </p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${Math.min(dashboard?.quarterly_outlook.target_accomplished_pct ?? 0, 100)}%` }}
              />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">Recent activity</h2>
            <div className="mt-5 space-y-3">
              {(dashboard?.recent_activity ?? []).length ? (
                (dashboard?.recent_activity ?? []).map((item, index) => (
                  <div key={`${item.event_type}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="text-sm font-bold text-slate-900">{item.description}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {item.performed_by} • {new Date(item.performed_at).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                  No recent activity.
                </div>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">Alert action history</h2>
            <div className="mt-5 space-y-3">
              {(alertHistoryQuery.data?.items ?? []).length ? (
                (alertHistoryQuery.data?.items ?? []).map((item, index) => (
                  <div key={`${item.event_type}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="text-sm font-bold text-slate-900">{item.title}</div>
                    <div className="mt-1 text-sm text-slate-600">{item.description}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {new Date(item.performed_at).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                  No alert actions logged yet.
                </div>
              )}
            </div>
          </article>
        </div>
      </section>

      {alertAction.isSuccess ? (
        <Toast
          variant="success"
          message={alertAction.data.message}
          onClose={() => alertAction.reset()}
        />
      ) : null}
    </div>
  );
}
