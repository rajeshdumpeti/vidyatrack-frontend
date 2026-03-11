type StudentsSetupFiltersProps = {
  sectionId: string;
  search: string;
  sections: ReadonlyArray<{ id: string; label: string }>;
  onFilterChange: (next: Partial<{ sectionId: string; search: string }>) => void;
};

export function StudentsSetupFilters({
  sectionId,
  search,
  sections,
  onFilterChange,
}: StudentsSetupFiltersProps) {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              Section
            </label>
            <select
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={sectionId}
              onChange={(event) =>
                onFilterChange({ sectionId: event.target.value })
              }
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900">
              Search (Name / Roll No)
            </label>
            <input
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={search}
              onChange={(event) =>
                onFilterChange({ search: event.target.value })
              }
              placeholder="Type student name or roll no"
              inputMode="search"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
