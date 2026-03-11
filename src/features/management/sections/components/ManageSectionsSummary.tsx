type ManageSectionsSummaryProps = {
  newClassName: string;
  setNewClassName: (value: string) => void;
  onCreateClass: () => void;
  isCreatingClass: boolean;
  totalClasses: number;
  totalSections: number;
};

export function ManageSectionsSummary({
  newClassName,
  setNewClassName,
  onCreateClass,
  isCreatingClass,
  totalClasses,
  totalSections,
}: ManageSectionsSummaryProps) {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          Quick Create
        </p>
        <h2 className="mt-1 text-lg font-extrabold text-slate-900">
          Add New Class
        </h2>
        <div className="mt-3 flex gap-2">
          <input
            value={newClassName}
            onChange={(event) => setNewClassName(event.target.value)}
            placeholder="e.g. Grade 9"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="button"
            onClick={onCreateClass}
            disabled={isCreatingClass}
            className="inline-flex h-11 items-center gap-1 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            Create
          </button>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          Total Classes
        </p>
        <p className="mt-2 text-3xl font-extrabold text-slate-900">
          {totalClasses}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Current school class groups.
        </p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          Total Sections
        </p>
        <p className="mt-2 text-3xl font-extrabold text-slate-900">
          {totalSections}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Distributed across all classes.
        </p>
      </article>
    </section>
  );
}
