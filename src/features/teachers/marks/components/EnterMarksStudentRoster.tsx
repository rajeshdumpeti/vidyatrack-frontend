import { History, Loader2, Search, Users } from "lucide-react";
import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";

import { prettyExamType } from "@/utils/exams";
import type { FormValues } from "../types/enterMarks.types";
import type { StudentListItem } from "@/types/student.types";
import { isValidMark } from "../helpers/enterMarks.helpers";

type EnterMarksStudentRosterProps = {
  selectedAssignmentSubjectName: string | null | undefined;
  activeExamType: string;
  totalStudents: number;
  hasExistingMarks: boolean;
  existingMarksCount: number;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isContextLoading: boolean;
  filteredStudents: StudentListItem[];
  showStudentRows: boolean;
  marks: Record<string, string>;
  existingMarksMap: Record<string, string>;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  maxMarks: number;
  errors: FieldErrors<FormValues>;
  studentsCount: number;
};

export function EnterMarksStudentRoster({
  selectedAssignmentSubjectName,
  activeExamType,
  totalStudents,
  hasExistingMarks,
  existingMarksCount,
  searchQuery,
  setSearchQuery,
  isContextLoading,
  filteredStudents,
  showStudentRows,
  marks,
  existingMarksMap,
  register,
  setValue,
  maxMarks,
  errors,
  studentsCount,
}: EnterMarksStudentRosterProps) {
  return (
    <div className="mb-6 mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-4 md:px-6 md:py-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3 md:items-center">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <div className="text-lg font-semibold text-gray-900 md:text-base">
                  Student Roster
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  {totalStudents} Students
                </span>
              </div>
              <div className="mt-1 text-xs font-medium leading-relaxed text-gray-500">
                Exam:{" "}
                <span className="text-gray-900">{prettyExamType(activeExamType)}</span>
                {" • "}Subject:{" "}
                <span className="text-gray-900">{selectedAssignmentSubjectName}</span>
                {hasExistingMarks ? (
                  <span className="ml-2 text-blue-600">
                    • {existingMarksCount} mark(s) loaded
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm md:w-auto">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search student..."
                className="w-full bg-transparent text-sm font-medium text-gray-700 outline-none placeholder:text-gray-400 md:w-48"
              />
            </div>
          </div>
        </div>
      </div>

      <ul className="divide-y divide-gray-100">
        {isContextLoading ? (
          <li className="px-4 py-10 md:px-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              Loading students and marks...
            </div>
          </li>
        ) : filteredStudents.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-gray-500 md:px-6">
            No students found for this class.
          </li>
        ) : null}

        {showStudentRows
          ? filteredStudents.map((student, index) => {
              const key = String(student.id);
              const rollNo =
                student.roll_no != null ? String(student.roll_no) : String(index + 1);
              const hasMark = marks[key]?.trim() !== "";
              const isExistingMark = existingMarksMap[key] !== undefined;
              const markError =
                (errors.marks as Record<string, { message?: string }> | undefined)?.[
                  key
                ]?.message ?? null;

              return (
                <li key={student.id} className="transition-colors hover:bg-gray-50/50">
                  <div className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-12 md:items-center md:gap-3 md:px-6">
                    <div className="md:col-span-2">
                      <div className="inline-flex items-center justify-center rounded-full bg-gray-100 px-3 py-1.5">
                        <span className="text-sm font-semibold text-gray-700">{rollNo}</span>
                      </div>
                    </div>

                    <div className="md:col-span-7">
                      <div className="flex items-center gap-2">
                        <div className="text-base font-semibold text-gray-900 md:text-sm">
                          {student.name}
                        </div>
                        {isExistingMark && !hasMark ? (
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                            Previously: {existingMarksMap[key]}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="md:col-span-3 md:flex md:justify-end">
                      <div className="relative w-full md:max-w-[220px]">
                        <input
                          type="tel"
                          inputMode="numeric"
                          disabled={isContextLoading}
                          placeholder={isExistingMark ? existingMarksMap[key] : "—"}
                          className={`
                            h-14 w-full rounded-xl border bg-white pl-4 pr-16 text-right text-base font-semibold text-gray-900 outline-none focus:ring-2 md:h-12 md:text-sm
                            ${hasMark ? "border-green-300 bg-green-50/30" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}
                            ${isExistingMark && !hasMark ? "border-blue-200 bg-blue-50/30" : ""}
                          `}
                          {...register(`marks.${key}` as const, {
                            validate: (value) =>
                              isValidMark(value, maxMarks) || `Enter 0–${maxMarks}`,
                            onChange: (event) => {
                              const raw = String(event.target.value ?? "");
                              const cleaned = raw.replace(/[^\d]/g, "");
                              setValue(`marks.${key}` as const, cleaned, {
                                shouldDirty: true,
                              });
                            },
                          })}
                          aria-label={`Marks for ${student.name}`}
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-gray-400 md:right-3 md:text-xs">
                          /{maxMarks}
                        </span>
                      </div>
                    </div>
                  </div>

                  {markError ? (
                    <div className="px-4 pb-3 text-right text-sm text-red-600 md:px-6">
                      {markError}
                    </div>
                  ) : null}
                </li>
              );
            })
          : null}
      </ul>

      <div className="border-t border-gray-200 px-4 py-4 md:px-6">
        <div className="flex flex-col gap-2 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <div>Showing {studentsCount} Students</div>
          {hasExistingMarks ? (
            <div className="flex items-center gap-2">
              <History className="h-3 w-3 text-blue-500" />
              <span className="font-medium text-blue-600">
                {existingMarksCount} student(s) have existing marks
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
