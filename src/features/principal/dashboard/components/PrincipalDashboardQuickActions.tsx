import { ClipboardCheck, GraduationCap, Users } from "lucide-react";
import { Link } from "react-router-dom";

export function PrincipalDashboardQuickActions() {
  return (
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
  );
}
