import { Pagination } from "@/components/ui/Pagination";
import type { StudentListItem } from "@/types/student.types";

import type { StudentsListPagination } from "../types/studentsList.types";

type StudentsTeacherListProps = {
  students: StudentListItem[];
  pagination: StudentsListPagination<StudentListItem>;
  className?: string | null;
  sectionName?: string | null;
  onOpenStudent: (student: StudentListItem) => void;
};

export function StudentsTeacherList({
  students,
  pagination,
  className,
  sectionName,
  onOpenStudent,
}: StudentsTeacherListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="text-sm font-semibold text-gray-900">Results</div>
        <div className="mt-1 text-xs font-medium text-gray-500">
          Showing {students.length} Students
        </div>
      </div>

      <ul className="divide-y divide-gray-100">
        {pagination.pagedItems.map((student, index) => {
          const roll =
            student.roll_no != null
              ? String(student.roll_no)
              : String(
                  (pagination.page - 1) * pagination.pageSize + index + 1,
                );

          return (
            <li key={student.id} className="px-4 py-4">
              <div className="flex w-full items-center justify-between gap-4 rounded-xl p-2 text-left">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 min-w-[44px] items-center justify-center rounded-lg bg-gray-100 px-2 text-sm font-bold text-gray-800">
                      {roll}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenStudent(student)}
                      className="truncate text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                    >
                      {student.name}
                    </button>
                  </div>

                  {className && sectionName ? (
                    <div className="mt-2 text-xs font-medium text-gray-500">
                      Section:{" "}
                      <span className="text-gray-900">
                        {className} - {sectionName}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
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
