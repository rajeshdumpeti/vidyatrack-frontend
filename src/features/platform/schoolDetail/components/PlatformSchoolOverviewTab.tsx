import type { PlatformSchoolDashboardMetrics } from "../types/platformSchoolDetail.types";

export function PlatformSchoolOverviewTab({
  metrics,
}: {
  metrics: PlatformSchoolDashboardMetrics | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3 mt-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-xs font-semibold uppercase text-blue-700">
          Teachers Mix
        </p>
        <p className="mt-1 text-sm text-blue-900">
          {metrics?.teachers ?? 0} registered teaching profiles mapped to this
          school.
        </p>
      </div>
      <div className="rounded-xl border border-green-100 bg-green-50 p-4">
        <p className="text-xs font-semibold uppercase text-green-700">
          Enrollment
        </p>
        <p className="mt-1 text-sm text-green-900">
          {metrics?.students ?? 0} active students in current academic cycle.
        </p>
      </div>
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
        <p className="text-xs font-semibold uppercase text-amber-700">
          Staff Coverage
        </p>
        <p className="mt-1 text-sm text-amber-900">
          {metrics?.staff ?? 0} non-student, non-teacher staff linked to
          operations.
        </p>
      </div>
    </div>
  );
}
