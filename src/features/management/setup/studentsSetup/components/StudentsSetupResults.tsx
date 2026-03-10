import type { StudentDto } from "@/types/student.types";

import { getSectionLabel } from "../helpers/studentsSetup.helpers";

type StudentsSetupResultsProps = {
  students: StudentDto[];
  sections: ReadonlyArray<{ id: string; label: string }>;
  onStudentClick: (student: StudentDto) => void;
};

export function StudentsSetupResults({
  students,
  sections,
  onStudentClick,
}: StudentsSetupResultsProps) {
  if (students.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="text-sm font-semibold text-gray-900">Results</div>
        <div className="mt-1 text-xs font-medium text-gray-500">
          Showing {students.length} Students
        </div>
      </div>

      <ul className="divide-y divide-gray-100">
        {students.map((student) => {
          const roll = student.roll_no ?? String(student.id);
          const sectionLabel = getSectionLabel(student.section_id, sections);

          return (
            <li key={student.id} className="px-4 py-4">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 rounded-xl p-2 text-left hover:bg-gray-50"
                onClick={() => onStudentClick(student)}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 min-w-[44px] items-center justify-center rounded-lg bg-gray-100 px-2 text-sm font-bold text-gray-800">
                      {roll}
                    </span>
                    <div className="truncate text-sm font-semibold text-gray-900">
                      {student.name}
                    </div>
                  </div>

                  <div className="mt-2 text-xs font-medium text-gray-500">
                    Section: <span className="text-gray-900">{sectionLabel}</span> •
                    Parent:{" "}
                    <span className="text-gray-900">{student.parent_phone}</span>
                  </div>
                </div>

                <span className="text-sm font-semibold text-gray-700">View</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
