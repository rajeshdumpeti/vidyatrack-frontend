import { Search } from "lucide-react";

type SubjectItem = {
  id: number;
  name: string;
};

type SubjectsDirectoryProps = {
  subjects: SubjectItem[];
  search: string;
  setSearch: (value: string) => void;
  subjectUsage: Map<
    number,
    { teacherCount: number; classCount: number; sectionCount: number }
  >;
};

export function SubjectsDirectory({
  subjects,
  search,
  setSearch,
  subjectUsage,
}: SubjectsDirectoryProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-sm font-bold text-slate-900">Subject Directory</h3>
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search subject..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
      <div className="p-4">
        {subjects.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-10 text-center text-sm font-medium text-slate-500">
            No subjects found for this filter.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <article
                key={subject.id}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {subject.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                    Required for {subjectUsage.get(subject.id)?.classCount ?? 0} classes
                  </span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    Assigned to {subjectUsage.get(subject.id)?.teacherCount ?? 0} teachers
                  </span>
                  <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                    Used in {subjectUsage.get(subject.id)?.sectionCount ?? 0} sections
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
