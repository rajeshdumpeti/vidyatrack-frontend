import { Pagination } from "@/components/ui/Pagination";
import type { StudentDto } from "@/types/student.types";

import type { StudentsListPagination } from "../types/studentsList.types";

type StudentsPrincipalTableProps = {
  students: StudentDto[];
  pagination: StudentsListPagination<StudentDto>;
  sectionLabelById: Map<number, string>;
  onOpenStudent: (student: StudentDto) => void;
  onViewStudent: (student: StudentDto) => void;
};

export function StudentsPrincipalTable({
  students,
  pagination,
  sectionLabelById,
  onOpenStudent,
  onViewStudent,
}: StudentsPrincipalTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="text-sm font-semibold text-gray-900">
          Showing {students.length} Students
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Avatar</th>
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Guardian</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pagination.pagedItems.map((student) => {
              const sectionLabel =
                student.section_name && student.class_name
                  ? `${student.class_name} - ${student.section_name}`
                  : (sectionLabelById.get(student.section_id) ??
                    `Section ${student.section_id}`);
              const initials = (student.name ?? "?")
                .trim()
                .slice(0, 2)
                .toUpperCase();
              const contact = student.parent_phone ?? "—";
              const studentCode = student.student_code ?? "—";
              const guardianName = student.parent_name ?? "—";
              const status = (student.status ?? "inactive").toLowerCase();
              const statusLabel = status === "active" ? "Active" : "Inactive";
              const statusClasses =
                status === "active"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-100 text-gray-600 border-gray-200";

              return (
                <tr key={student.id} className="align-middle">
                  <td className="px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                      {initials}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onOpenStudent(student)}
                      className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                    >
                      {student.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                    {studentCode}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {sectionLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {guardianName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{contact}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses}`}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      onClick={() => onViewStudent(student)}
                    >
                      View
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
