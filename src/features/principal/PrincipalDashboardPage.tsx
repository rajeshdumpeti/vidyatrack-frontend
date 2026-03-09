import { Activity, ClipboardCheck, GraduationCap, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { usePrincipalDashboard } from "@/hooks/usePrincipalDashboard";

export function PrincipalDashboardPage() {
  const dashboardQuery = usePrincipalDashboard();

  if (dashboardQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <LoadingState label="Loading principal overview..." />
      </div>
    );
  }

  if (dashboardQuery.error || !dashboardQuery.data) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <ErrorState
          title="Unable to load principal overview"
          message="Please try again."
        />
      </div>
    );
  }

  const data = dashboardQuery.data;
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Principal Overview
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Operational snapshot for attendance, staff, and student performance.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                Total Students
              </p>
              <p className="mt-2 text-3xl font-extrabold text-blue-900">
                {data.total_students}
              </p>
            </article>
            <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Total Teachers
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-900">
                {data.total_teachers}
              </p>
            </article>
            <article className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">
                Attendance Today
              </p>
              <p className="mt-2 text-3xl font-extrabold text-indigo-900">
                {data.attendance_today_pct}%
              </p>
              <p className="mt-1 text-xs font-medium text-indigo-700">
                {data.attendance_today_present} present • {data.attendance_today_absent} absent
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
            Quick Actions
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Link
              to="/principal/attendance"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
            >
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Attendance Overview
              </p>
            </Link>
            <Link
              to="/principal/marks"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
            >
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Marks Overview
              </p>
            </Link>
            <Link
              to="/principal/teachers"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
            >
              <Users className="h-5 w-5 text-emerald-600" />
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Teacher Directory
              </p>
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Activity className="h-4 w-4 text-blue-600" />
            System Notices
          </div>
          {data.notices.length === 0 ? (
            <p className="mt-2 text-sm font-medium text-slate-500">
              No notices right now.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {data.notices.map((notice) => (
                <article
                  key={notice.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {notice.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{notice.message}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
