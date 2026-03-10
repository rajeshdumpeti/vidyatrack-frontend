import { Pagination } from "@/components/ui/Pagination";

import type { StudentUi } from "../types/markAttendance.types";

type MarkAttendanceStudentTableProps = {
  students: StudentUi[];
  presentById: Record<string, boolean>;
  isReadOnly: boolean;
  onToggleStatus: (studentId: string) => void;
  pagination: {
    pagedItems: StudentUi[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    from: number;
    to: number;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
  };
};

export function MarkAttendanceStudentTable({
  presentById,
  isReadOnly,
  onToggleStatus,
  pagination,
}: MarkAttendanceStudentTableProps) {
  return (
    <div className="mb-10 overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm md:rounded-3xl md:border-gray-200">
      <div className="grid grid-cols-12 border-b border-gray-100 bg-gray-50/50 px-2 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 md:px-8 md:py-5 md:text-[11px] md:font-bold">
        <div className="col-span-2">Roll No.</div>
        <div className="col-span-6 md:col-span-6">Student Name</div>
        <div className="col-span-4 text-center">Status Selection</div>
      </div>

      <div className="divide-y divide-gray-50 md:divide-gray-100">
        {pagination.pagedItems.map((student) => {
          const isPresent = presentById[student.id] !== false;

          return (
            <div
              key={student.id}
              className={`grid grid-cols-12 items-center px-2 py-4 transition-colors md:px-8 md:py-5 ${
                isPresent ? "bg-white" : "bg-[#FFF5F5] md:bg-red-50"
              }`}
            >
              <div className="col-span-2 text-sm font-bold text-gray-400">
                {student.rollNo}
              </div>
              <div className="col-span-6 flex items-center gap-3 truncate md:col-span-6 md:gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-black transition-colors md:font-bold ${
                    isPresent
                      ? "bg-blue-50 text-blue-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {student.initials}
                </div>
                <div className="truncate">
                  <div className="truncate text-[14px] font-bold text-gray-900 md:text-sm">
                    {student.name}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-tighter text-gray-400 md:font-medium">
                    Standard Plan
                  </div>
                </div>
              </div>
              <div className="col-span-4 flex justify-center">
                <div className="inline-flex items-center rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(student.id)}
                    disabled={isReadOnly}
                    className={`
                      h-11 min-w-[120px] rounded-xl px-4 text-sm font-semibold transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-100
                      disabled:cursor-not-allowed disabled:opacity-60
                      ${
                        isPresent
                          ? "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                          : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      }
                    `}
                    aria-label={
                      isPresent
                        ? `Mark ${student.name} absent`
                        : `Mark ${student.name} present`
                    }
                  >
                    {isPresent ? "Present" : "Absent"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
