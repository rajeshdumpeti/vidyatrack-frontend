import type { PlatformSchoolDashboardMetrics } from "../types/platformSchoolDetail.types";

export function PlatformSchoolMetricsGrid({
  metrics,
}: {
  metrics: PlatformSchoolDashboardMetrics | null;
}) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Registered Teachers
        </div>
        <div className="mt-2 text-2xl font-bold text-gray-900">
          {metrics?.teachers ?? "-"}
        </div>
      </article>
      <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Registered Students
        </div>
        <div className="mt-2 text-2xl font-bold text-gray-900">
          {metrics?.students ?? "-"}
        </div>
      </article>
      <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          All Staff
        </div>
        <div className="mt-2 text-2xl font-bold text-gray-900">
          {metrics?.staff ?? "-"}
        </div>
      </article>
      <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Total Registered
        </div>
        <div className="mt-2 text-2xl font-bold text-gray-900">
          {metrics?.total ?? "-"}
        </div>
      </article>
    </section>
  );
}
