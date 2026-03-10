export function SubjectsSummaryCards({
  registeredCount,
}: {
  registeredCount: number;
}) {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          Registered Subjects
        </p>
        <p className="mt-2 text-3xl font-extrabold text-slate-900">
          {registeredCount}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Matching current filters.
        </p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          Data Quality
        </p>
        <p className="mt-2 text-3xl font-extrabold text-emerald-700">Ready</p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Catalog supports assignment workflows.
        </p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          Last Update
        </p>
        <p className="mt-2 text-3xl font-extrabold text-slate-900">Live</p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Changes appear instantly.
        </p>
      </article>
    </section>
  );
}
