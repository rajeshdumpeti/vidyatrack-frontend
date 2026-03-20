import type { SchoolDto } from "@/types/school.types";

type ManageSchoolsListProps = {
  schools: SchoolDto[];
};

export function ManageSchoolsList({ schools }: ManageSchoolsListProps) {
  if (schools.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="text-sm font-semibold text-gray-900">Schools</div>
        <div className="mt-1 text-xs font-medium text-gray-500">
          Showing {schools.length} Schools
        </div>
      </div>

      <ul className="divide-y divide-gray-100">
        {schools.map((school) => (
          <li key={school.id} className="px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-gray-900">
                  {school.name}
                </div>
                <div className="mt-1 text-xs font-medium text-gray-500">
                  ID: <span className="text-gray-900">{school.id}</span>
                </div>
              </div>

              <span className="inline-flex h-9 items-center rounded-full bg-gray-900 px-4 text-sm font-semibold text-white">
                View
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
