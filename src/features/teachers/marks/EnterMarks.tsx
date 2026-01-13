import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { logger } from "../../../utils/logger";
import { useTeacherAttendanceSection } from "../../../hooks/useTeacherAttendanceSection";
import { useStudentsBySection } from "../../../hooks/useStudentsBySection";
import { useMarksSubmit } from "../../../hooks/useMarksSubmit";
import type { MarksExamTypeDto } from "../../../types/marks-submit.types";
import { useNavigate } from "react-router-dom";

type ExamType =
  | "Unit Test"
  | "Monthly Test"
  | "Quarterly"
  | "Half Yearly"
  | "Annual";

type StudentRow = {
  id: number;
  rollNo: string;
  name: string;
};

type FormValues = {
  examType: ExamType;
  subjectId: string;
  // marks keyed by student id
  marks: Record<string, string>;
};
const SUBJECT_ID_MAP: Record<string, number> = {
  math: 1,
  eng: 2,
  sci: 3,
};

const MOCK_EXAM_TYPES: ExamType[] = [
  "Unit Test",
  "Monthly Test",
  "Quarterly",
  "Half Yearly",
  "Annual",
];

const MOCK_SUBJECTS = [
  { id: "math", label: "Mathematics" },
  { id: "eng", label: "English" },
  { id: "sci", label: "Science" },
];
function mapExamTypeToDto(exam: ExamType): MarksExamTypeDto {
  switch (exam) {
    case "Unit Test":
      return "UNIT_TEST";
    case "Monthly Test":
      return "MONTHLY_TEST";
    case "Quarterly":
      return "QUARTERLY";
    case "Half Yearly":
      return "HALF_YEARLY";
    case "Annual":
      return "ANNUAL";
  }
}
const MOCK_STUDENTS: StudentRow[] = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  rollNo: String(i + 1).padStart(2, "0"),
  name: `Student ${i + 1}`,
}));

function isValidMark(value: string) {
  if (value.trim() === "") return true; // allow empty as placeholder
  const n = Number(value);
  if (!Number.isFinite(n)) return false;
  if (n < 0) return false;
  if (n > 100) return false; // placeholder validation for pilot UX
  return true;
}

export function EnterMarks() {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const sectionQuery = useTeacherAttendanceSection();
  const sectionId = sectionQuery.data?.section_id;
  const studentsQuery = useStudentsBySection(sectionId);
  const navigate = useNavigate();

  const {
    submit,
    isLoading: isSubmitting,
    error: submitError,
  } = useMarksSubmit();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      examType: "Unit Test",
      subjectId: "",
      marks: {},
    },
    mode: "onBlur",
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const subjectId = watch("subjectId");
  const examType = watch("examType");

  const onSubmit = (values: FormValues) => {
    if (!sectionId) return;

    setSubmitSuccess(false);

    const examTypeDto = mapExamTypeToDto(values.examType);

    // Only submit students where a mark was entered (UI-first, no forced zeros)
    const entries = (studentsQuery.data ?? [])
      .map((s) => {
        const raw = values.marks?.[String(s.id)] ?? "";
        const trimmed = String(raw).trim();
        if (!trimmed) return null;
        const n = Number(trimmed);
        if (!Number.isFinite(n)) return null;
        return { studentId: s.id, marks: n };
      })
      .filter(Boolean) as Array<{ studentId: number; marks: number }>;
    if (!SUBJECT_ID_MAP[values.subjectId]) {
      logger.warn("[teacher][marks] invalid subject mapping", {
        subjectId: values.subjectId,
      });
      return;
    }

    submit(
      {
        sectionId,
        subjectId: SUBJECT_ID_MAP[values.subjectId],
        examType: examTypeDto,
        students: entries,
        concurrency: 8,
      },
      {
        onSuccess: () => {
          setSubmitSuccess(true);
          navigate("/teacher", {
            replace: true,
            state: { toast: "Marks submitted" },
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <header className="bg-gray-50 px-4 pt-6">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Enter Marks
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Select exam type and subject, then enter marks per student.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-5">
        {/* Controls */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Exam Type */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <label className="block text-sm font-semibold text-gray-900">
                Exam Type
              </label>
              <select
                className="mt-3 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                {...register("examType", { required: true })}
              >
                {MOCK_EXAM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Choose the exam category (mocked list for now).
              </p>
            </div>

            {/* Subject */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <label className="block text-sm font-semibold text-gray-900">
                Subject
              </label>
              <select
                className={[
                  "mt-3 h-12 w-full rounded-xl border bg-white px-3 text-sm font-medium outline-none",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                  errors.subjectId ? "border-red-300" : "border-gray-200",
                ].join(" ")}
                {...register("subjectId", {
                  required: "Subject is required",
                })}
              >
                <option value="">Select subject</option>
                {MOCK_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>

              {errors.subjectId ? (
                <p className="mt-2 text-sm text-red-600">
                  {errors.subjectId.message}
                </p>
              ) : (
                <p className="mt-2 text-xs text-gray-500">
                  Subject list is mocked; backend wiring comes later.
                </p>
              )}
            </div>
          </div>

          {/* Student list + mark inputs */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    Students
                  </div>
                  <div className="text-xs font-medium text-gray-500">
                    Exam: <span className="text-gray-900">{examType}</span> •
                    Subject:{" "}
                    <span className="text-gray-900">
                      {subjectId ? subjectId : "Not selected"}
                    </span>
                  </div>
                </div>
                <div className="text-xs font-medium text-gray-500">
                  Marks: 0–100 (placeholder validation)
                </div>
              </div>
            </div>

            <ul className="divide-y divide-gray-100">
              {MOCK_STUDENTS.map((s) => {
                const key = String(s.id);
                return (
                  <li key={s.id} className="bg-white">
                    <div className="grid grid-cols-12 items-center gap-3 px-4 py-4">
                      <div className="col-span-2 text-sm font-semibold text-gray-700">
                        {s.rollNo}
                      </div>

                      <div className="col-span-7 min-w-0">
                        <div className="truncate text-sm font-semibold text-gray-900">
                          {s.name}
                        </div>
                      </div>

                      <div className="col-span-3 flex justify-end">
                        <input
                          type="tel"
                          inputMode="numeric"
                          placeholder="—"
                          className="h-12 w-full max-w-[140px] rounded-xl border border-gray-200 bg-white px-3 text-right text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          {...register(`marks.${key}` as const, {
                            validate: (v) => isValidMark(v) || "Enter 0–100",
                            onChange: (e) => {
                              // keep only digits + optional decimal? (pilot: digits only)
                              const raw = String(e.target.value ?? "");
                              const cleaned = raw.replace(/[^\d]/g, "");
                              setValue(`marks.${key}` as const, cleaned, {
                                shouldDirty: true,
                              });
                            },
                          })}
                          aria-label={`Marks for ${s.name}`}
                        />
                      </div>
                    </div>

                    {/* validation placeholder (shows only when invalid) */}
                    {errors.marks && (errors.marks as any)[key] ? (
                      <div className="px-4 pb-3 text-right text-sm text-red-600">
                        {(errors.marks as any)[key]?.message ?? "Invalid mark"}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <div className="px-4 py-3 text-center text-sm text-gray-500">
              Showing {MOCK_STUDENTS.length} Students
            </div>
          </div>

          {/* Sticky footer CTA */}
          <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
              <div className="text-sm font-medium text-gray-600">
                {submitSuccess ? (
                  <span className="font-semibold text-green-700">
                    Marks captured (UI-only).
                  </span>
                ) : (
                  <span>
                    Ensure exam type & subject are selected before submitting.
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 min-w-[180px] rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit Marks"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
