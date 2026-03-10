type TeachersListFiltersProps = {
  search: string;
  statusFilter: string;
  subjectFilter: string;
  allAssignments: string[];
  setSearch: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setSubjectFilter: (value: string) => void;
};

export function TeachersListFilters({
  search,
  statusFilter,
  subjectFilter,
  allAssignments,
  setSearch,
  setStatusFilter,
  setSubjectFilter,
}: TeachersListFiltersProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_0.7fr_0.7fr]">
        <div>
          <label className="block text-xs font-semibold text-gray-600">
            Search
          </label>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, ID or email"
            inputMode="search"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600">
            All Subjects
          </label>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
          >
            <option value="ALL">All Subjects</option>
            {allAssignments.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600">
            All Statuses
          </label>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
}
