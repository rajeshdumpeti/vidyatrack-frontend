import { Pagination } from "@/components/ui/Pagination";
import type { PrincipalMarksRowDto } from "@/types/principalMarks.types";

import { getStudentClassLabel, pct } from "../helpers/marksHistory.helpers";
import type { MarksHistoryPagination } from "../types/marksHistory.types";

type MarksHistoryStudentResultsTableProps = {
  search: string;
  setSearch: (value: string) => void;
  pagination: MarksHistoryPagination;
  sectionLabelById: Map<number, string>;
  onOpenStudent: (row: PrincipalMarksRowDto) => void;
  onExport: () => void;
};

export function MarksHistoryStudentResultsTable({
  search,
  setSearch,
  pagination,
  sectionLabelById,
  onOpenStudent,
  onExport,
}: MarksHistoryStudentResultsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">
              Student Results
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Search and open student profile or export current list.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by student or roll..."
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={onExport}
              className="h-10 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Roll</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Marks</th>
              <th className="px-4 py-3">Percent</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pagination.pagedItems.map((row) => {
              const percent = pct((row.marks_obtained / row.max_marks) * 100);
              return (
                <tr key={row.id}>
                  <td className="px-4 py-3">{row.roll_no ?? row.student_id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    <button
                      type="button"
                      onClick={() => onOpenStudent(row)}
                      className="font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                    >
                      {row.student_name ?? `Student #${row.student_id}`}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {getStudentClassLabel(row, sectionLabelById)}
                  </td>
                  <td className="px-4 py-3">
                    {row.marks_obtained}/{row.max_marks}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                        percent >= 75
                          ? "bg-green-50 text-green-700"
                          : percent >= 35
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700",
                      ].join(" ")}
                    >
                      {percent}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenStudent(row)}
                      className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Open Student
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        totalPages={pagination.totalPages}
        from={pagination.from}
        to={pagination.to}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  );
}
