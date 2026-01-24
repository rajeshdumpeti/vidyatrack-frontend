import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { logger } from "@/utils/logger";
import { useStudentsBySection } from "@/hooks/useStudentsBySection";
import { useMarksSubmit } from "@/hooks/useMarksSubmit";
import type { MarksExamTypeDto } from "@/types/marks-submit.types";
import { useNavigate } from "react-router-dom";
import { useMyTeachingAssignments } from "@/hooks/useMyTeachingAssignments";
import { CheckCircle, Save, AlertCircle, Loader2, History } from "lucide-react";
import { useExistingMarks } from "@/hooks/useExistingMarks"; // Add this import

type ExamType =
  | "Unit Test"
  | "Monthly Test"
  | "Quarterly"
  | "Half Yearly"
  | "Annual";

type FormValues = {
  examType: ExamType;
  assignmentId: string;
  marks: Record<string, string>;
};

const MOCK_EXAM_TYPES: ExamType[] = [
  "Unit Test",
  "Monthly Test",
  "Quarterly",
  "Half Yearly",
  "Annual",
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

function isValidMark(value: string) {
  if (!value || typeof value !== "string") return true;
  const trimmed = value.trim();
  if (trimmed === "") return true;

  const n = Number(trimmed);
  if (!Number.isFinite(n)) return false;
  if (n < 0) return false;
  if (n > 100) return false;
  return true;
}

export function EnterMarks() {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [hasLoadedExistingMarks, setHasLoadedExistingMarks] = useState(false);

  const assignmentsQuery = useMyTeachingAssignments();
  const navigate = useNavigate();

  const { submit, isLoading: isSubmitting } = useMarksSubmit();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      examType: "Unit Test",
      assignmentId: "",
      marks: {},
    },
    mode: "onBlur",
  });

  const watchAssignmentId = watch("assignmentId");
  const examType = watch("examType");
  const marks = watch("marks");

  // Convert exam type to DTO for API
  const examTypeDto = useMemo(() => mapExamTypeToDto(examType), [examType]);

  const selectedAssignment = useMemo(() => {
    const list = assignmentsQuery.data ?? [];
    return list.find(
      (a) => `${a.section_id}-${a.subject_id}` === watchAssignmentId,
    );
  }, [assignmentsQuery.data, watchAssignmentId]);

  const studentsQuery = useStudentsBySection(selectedAssignment?.section_id);

  // Use the existing marks hook
  const {
    data: existingMarks = {},
    isLoading: loadingExistingMarks,
    refetch: refetchExistingMarks,
  } = useExistingMarks(
    selectedAssignment?.section_id,
    selectedAssignment?.subject_id,
    examTypeDto,
  );

  // Load existing marks into the form when they are fetched
  useEffect(() => {
    if (
      existingMarks &&
      Object.keys(existingMarks).length > 0 &&
      !hasLoadedExistingMarks &&
      selectedAssignment
    ) {
      // Set each existing mark in the form
      Object.entries(existingMarks).forEach(([studentId, mark]) => {
        setValue(`marks.${studentId}` as const, mark, {
          shouldDirty: false, // Don't mark as dirty since we're loading existing data
          shouldValidate: true,
        });
      });
      setHasLoadedExistingMarks(true);
    }
  }, [existingMarks, selectedAssignment, setValue, hasLoadedExistingMarks]);

  // Reset the loaded flag when assignment or exam type changes
  useEffect(() => {
    setHasLoadedExistingMarks(false);
  }, [watchAssignmentId, examType]);

  // Auto-save functionality
  useEffect(() => {
    if (!isDirty) return;

    const timeoutId = setTimeout(() => {
      setIsAutoSaving(true);
      setAutoSaveStatus("saving");

      // Simulate auto-save
      setTimeout(() => {
        setIsAutoSaving(false);
        setAutoSaveStatus("saved");

        // Clear saved status after 2 seconds
        setTimeout(() => {
          setAutoSaveStatus("idle");
        }, 2000);
      }, 500);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [isDirty, marks, watchAssignmentId, examType]);

  const handleSaveDraft = (values: FormValues) => {
    console.log("Draft saved:", values);
    setAutoSaveStatus("saved");
    setTimeout(() => setAutoSaveStatus("idle"), 1500);
  };

  const handleOpenConfirmation = (values: FormValues) => {
    setFormData(values);
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = () => {
    if (!formData || !selectedAssignment) return;

    const examTypeDto = mapExamTypeToDto(formData.examType);
    const entries = (studentsQuery.data ?? [])
      .map((s) => {
        const raw = formData.marks?.[String(s.id)] ?? "";
        const trimmed = String(raw).trim();
        if (!trimmed) return null;
        const n = Number(trimmed);
        if (!Number.isFinite(n)) return null;
        return { studentId: s.id, marks: n };
      })
      .filter(Boolean) as Array<{ studentId: number; marks: number }>;

    if (!selectedAssignment.subject_id) {
      logger.warn("[teacher][marks] missing subject_id", {
        assignmentId: formData.assignmentId,
      });
      return;
    }

    submit(
      {
        sectionId: selectedAssignment.section_id,
        subjectId: selectedAssignment.subject_id,
        examType: examTypeDto,
        students: entries,
        concurrency: 8,
      },
      {
        onSuccess: () => {
          setSubmitSuccess(true);
          setShowConfirmModal(false);
          // Refetch existing marks after successful submission
          refetchExistingMarks();
          navigate("/teacher", {
            replace: true,
            state: { toast: "Marks submitted successfully" },
          });
        },
      },
    );
  };

  const totalStudents = (studentsQuery.data ?? []).length;
  const filledMarks = marks
    ? Object.values(marks).filter((mark) => mark && mark.trim() !== "").length
    : 0;
  const completionPercentage =
    totalStudents > 0 ? Math.round((filledMarks / totalStudents) * 100) : 0;

  // Check if there are existing marks
  const hasExistingMarks =
    existingMarks && Object.keys(existingMarks).length > 0;
  const existingMarksCount = hasExistingMarks
    ? Object.keys(existingMarks).length
    : 0;

  // Replace the entire return statement from the Enter Marks component

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            className="text-sm font-semibold text-blue-600"
            onClick={() => navigate("/teacher")}
          >
            ← Back
          </button>
          <div className="text-base font-bold text-gray-900 tracking-tight">
            Enter Marks
          </div>
          <div />
        </div>

        {/* Main Content Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-gray-900">Enter Marks</h1>
            <p className="mt-1 text-sm text-gray-600">
              Select exam type and subject, then enter marks per student.
            </p>
          </div>

          {/* Existing Marks Notification */}
          {loadingExistingMarks && selectedAssignment && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-700">
                Checking for existing marks...
              </span>
            </div>
          )}

          {hasExistingMarks && !loadingExistingMarks && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3">
              <History className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Found existing marks for {existingMarksCount} student(s)
              </span>
              <span className="text-sm text-blue-600">
                • You can update them below
              </span>
            </div>
          )}

          {/* Progress Section */}
          {/* <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Progress:{" "}
                  <span className="text-blue-600">{completionPercentage}%</span>
                </div>
                <div className="text-xs text-gray-500">
                  {filledMarks} of {totalStudents} students
                </div>
              </div>
              <div className="flex items-center gap-2">
                {autoSaveStatus === "saving" && (
                  <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 border border-gray-200">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                    <span className="text-xs font-medium text-gray-600">
                      Saving...
                    </span>
                  </div>
                )}
                {autoSaveStatus === "saved" && (
                  <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 border border-gray-200">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-medium text-gray-600">
                      Saved
                    </span>
                  </div>
                )}
                {autoSaveStatus === "idle" && isDirty && (
                  <div className="rounded-full bg-white px-3 py-1.5 border border-gray-200">
                    <span className="text-xs font-medium text-gray-500">
                      Unsaved changes
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div> */}

          {/* Form */}
          <form
            onSubmit={handleSubmit((values) => handleOpenConfirmation(values))}
          >
            {/* Selection Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Exam Type Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Exam Type
                </label>
                <select
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  {...register("examType", { required: true })}
                >
                  {MOCK_EXAM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Choose the exam category.
                </p>
              </div>

              {/* Class & Subject Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Class & Subject
                </label>
                <select
                  className={[
                    "h-12 w-full rounded-xl border bg-white px-3 text-sm font-semibold outline-none",
                    "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                    errors.assignmentId ? "border-red-300" : "border-gray-200",
                  ].join(" ")}
                  {...register("assignmentId", {
                    required: "Class & subject is required",
                  })}
                >
                  <option value="">Select class & subject</option>
                  {(assignmentsQuery.data ?? []).map((a) => (
                    <option
                      key={`${a.section_id}-${a.subject_id}`}
                      value={`${a.section_id}-${a.subject_id}`}
                    >
                      {a.class_name} - {a.subject_name}
                    </option>
                  ))}
                </select>
                {errors.assignmentId ? (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.assignmentId.message}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">
                    Choose a class and subject from your assignments.
                  </p>
                )}
              </div>
            </div>

            {/* Student List Card */}
            {selectedAssignment && (
              <div className="mb-6 rounded-2xl border border-gray-200 bg-white overflow-hidden">
                {/* Card Header */}
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        Students
                      </div>
                      <div className="text-xs font-medium text-gray-500">
                        Exam: <span className="text-gray-900">{examType}</span>{" "}
                        • Subject:{" "}
                        <span className="text-gray-900">
                          {selectedAssignment.subject_name}
                        </span>
                        {hasExistingMarks && (
                          <span className="ml-2 text-blue-600">
                            • {existingMarksCount} mark(s) loaded
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs font-medium text-gray-500">
                      Marks: 0–100
                    </div>
                  </div>
                </div>

                {/* Students List */}
                <ul className="divide-y divide-gray-100">
                  {(studentsQuery.data ?? []).map((s, idx) => {
                    const key = String(s.id);
                    const rollNo =
                      s.roll_no != null ? String(s.roll_no) : String(idx + 1);
                    const hasMark = marks[key]?.trim() !== "";
                    const isExistingMark =
                      existingMarks && existingMarks[key] !== undefined;

                    return (
                      <li
                        key={s.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="grid grid-cols-12 items-center gap-3 px-6 py-4">
                          {/* Roll Number */}
                          <div className="col-span-2">
                            <div className="inline-flex items-center justify-center rounded-full bg-gray-100 px-3 py-1.5">
                              <span className="text-sm font-semibold text-gray-700">
                                {rollNo}
                              </span>
                            </div>
                          </div>

                          {/* Student Name */}
                          <div className="col-span-7">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-semibold text-gray-900">
                                {s.name}
                              </div>
                              {isExistingMark && !hasMark && (
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                  Previously: {existingMarks[key]}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Marks Input */}
                          <div className="col-span-3 flex justify-end">
                            <div className="relative w-full max-w-[140px]">
                              <input
                                type="tel"
                                inputMode="numeric"
                                placeholder={
                                  isExistingMark ? existingMarks[key] : "—"
                                }
                                className={`
                                h-12 w-full rounded-xl border bg-white px-3 text-right text-sm font-semibold text-gray-900 outline-none focus:ring-2
                                ${hasMark ? "border-green-300 bg-green-50/30" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}
                                ${isExistingMark && !hasMark ? "border-blue-200 bg-blue-50/30" : ""}
                              `}
                                {...register(`marks.${key}` as const, {
                                  validate: (v) =>
                                    isValidMark(v) || "Enter 0–100",
                                  onChange: (e) => {
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
                        </div>

                        {errors.marks && (errors.marks as any)[key] && (
                          <div className="px-6 pb-3 text-right text-sm text-red-600">
                            {(errors.marks as any)[key]?.message ??
                              "Invalid mark"}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* Card Footer */}
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>
                      Showing {(studentsQuery.data ?? []).length} Students
                    </div>
                    {hasExistingMarks && (
                      <div className="flex items-center gap-2">
                        <History className="h-3 w-3 text-blue-500" />
                        <span className="font-medium text-blue-600">
                          {existingMarksCount} student(s) have existing marks
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleSubmit(handleSaveDraft)}
                disabled={!isDirty || isAutoSaving}
                className="h-12 rounded-xl border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAutoSaving ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || filledMarks === 0}
                className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Marks"}
              </button>
            </div>
          </form>

          {/* Completion Status */}
          {completionPercentage === 100 && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    All marks entered
                  </span>
                </div>
                {hasExistingMarks && (
                  <span className="text-sm text-blue-600">
                    Editing {existingMarksCount} existing mark(s)
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-green-700">
                {filledMarks} of {totalStudents} students have marks entered
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal (keep as is) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Finalize Marks Submission
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  You are about to submit marks for{" "}
                  <strong>{filledMarks} students</strong>.
                  {hasExistingMarks && (
                    <span className="block mt-1 text-blue-600">
                      This will update {existingMarksCount} existing mark(s).
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="my-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    Important Notice
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    Once submitted, marks will be locked. Any future changes
                    will require a formal correction request with admin
                    approval.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Continue Editing
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit Marks"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
