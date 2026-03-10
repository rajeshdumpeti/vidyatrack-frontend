type PrincipalDashboardStatsProps = {
  totalStudents: number;
  totalTeachers: number;
  attendanceTodayPct: number;
  attendanceTodayPresent: number;
  attendanceTodayAbsent: number;
};

export function PrincipalDashboardStats({
  totalStudents,
  totalTeachers,
  attendanceTodayPct,
  attendanceTodayPresent,
  attendanceTodayAbsent,
}: PrincipalDashboardStatsProps) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
      <article className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
          Total Students
        </p>
        <p className="mt-2 text-3xl font-extrabold text-blue-900">
          {totalStudents}
        </p>
      </article>
      <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          Total Teachers
        </p>
        <p className="mt-2 text-3xl font-extrabold text-emerald-900">
          {totalTeachers}
        </p>
      </article>
      <article className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">
          Attendance Today
        </p>
        <p className="mt-2 text-3xl font-extrabold text-indigo-900">
          {attendanceTodayPct}%
        </p>
        <p className="mt-1 text-xs font-medium text-indigo-700">
          {attendanceTodayPresent} present • {attendanceTodayAbsent} absent
        </p>
      </article>
    </div>
  );
}
