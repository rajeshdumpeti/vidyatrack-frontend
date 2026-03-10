type ManagementStudentsFiltersProps = {
  search: string;
  setSearch: (value: string) => void;
  sectionId: string;
  setSectionId: (value: string) => void;
  sectionsLoading: boolean;
  sections: Array<{ id: number; class_id?: number; name?: string | null }>;
  sectionLabelById: Map<number, string>;
};

export function ManagementStudentsFilters({
  search,
  setSearch,
  sectionId,
  setSectionId,
  sectionsLoading,
  sections,
  sectionLabelById,
}: ManagementStudentsFiltersProps) {
  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600">Search</label>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or admission number..."
            className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-300"
          />
        </div>
        <div className="min-w-[200px]">
          <label className="block text-xs font-semibold text-gray-600">Section</label>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-gray-300 disabled:opacity-60"
            value={sectionId}
            onChange={(event) => setSectionId(event.target.value)}
            disabled={sectionsLoading}
          >
            <option value="">All Sections</option>
            {sections.map((section) => {
              const label = sectionLabelById.get(section.id) ?? `Section ${section.id}`;
              return (
                <option key={section.id} value={section.id}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
}
