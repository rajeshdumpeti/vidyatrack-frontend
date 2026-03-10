import type { SectionDto } from "@/types/section.types";

type StudentsListFiltersProps = {
  isTeacher: boolean;
  search: string;
  sectionId: string;
  sections: SectionDto[];
  sectionsLoading: boolean;
  sectionLabelById: Map<number, string>;
  onFilterChange: (next: Partial<{ sectionId: string; search: string }>) => void;
};

export function StudentsListFilters({
  isTeacher,
  search,
  sectionId,
  sections,
  sectionsLoading,
  sectionLabelById,
  onFilterChange,
}: StudentsListFiltersProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600">
            Search
          </label>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={search}
            onChange={(event) => onFilterChange({ search: event.target.value })}
            placeholder="Search by name or admission number..."
            inputMode="search"
          />
        </div>
        {!isTeacher ? (
          <div className="min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600">
              All Classes
            </label>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              value={sectionId}
              onChange={(event) =>
                onFilterChange({ sectionId: event.target.value })
              }
              disabled={sectionsLoading}
            >
              <option value="">All Classes</option>
              {sections.map((section) => {
                const label =
                  sectionLabelById.get(section.id) ?? `Section ${section.id}`;
                return (
                  <option key={section.id} value={section.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        ) : null}
      </div>
    </div>
  );
}
