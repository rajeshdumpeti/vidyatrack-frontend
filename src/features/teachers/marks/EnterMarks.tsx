import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { logger } from "@/utils/logger";
import { useStudentsBySection } from "@/hooks/useStudentsBySection";
import { useMarksSubmit } from "@/hooks/useMarksSubmit";
import { useLocation, useNavigate } from "react-router-dom";
import { useMyTeachingAssignments } from "@/hooks/useMyTeachingAssignments";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  History,
  BookOpen,
  Ruler,
  Search,
  Users,
} from "lucide-react";
import { useExistingMarks } from "@/hooks/useExistingMarks";
import { useTeacherAttendanceSection } from "@/hooks/useTeacherAttendanceSection";

type FormValues = {
  maxMarks: string;
  assignmentId: string;
  marks: Record<string, string>;
};

const EXAM_TYPE_PRESETS = [
  { label: "Unit Test", value: "UNIT_TEST" },
  { label: "Monthly Test", value: "MONTHLY_TEST" },
  { label: "Quarterly", value: "QUARTERLY" },
  { label: "Half Yearly", value: "HALF_YEARLY" },
  { label: "Annual", value: "ANNUAL" },
] as const;

function normalizeExamType(raw: string): string {
  const base = String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return base.slice(0, 32);
}

function prettyExamType(value: string): string {
  const preset = EXAM_TYPE_PRESETS.find((p) => p.value === value);
  if (preset) return preset.label;
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part[0] + part.slice(1).toLowerCase())
    .join(" ");
}

function isValidMark(value: string, maxMarks: number) {
  if (!value || typeof value !== "string") return true;
  const trimmed = value.trim();
  if (trimmed === "") return true;

  const n = Number(trimmed);
  if (!Number.isFinite(n)) return false;
  if (n < 0) return false;
  if (n > maxMarks) return false;
  return true;
}

export function EnterMarks() {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeExamType, setActiveExamType] = useState<string>("UNIT_TEST");
  const [showCustomExamInput, setShowCustomExamInput] = useState(false);
  const [customExamDraft, setCustomExamDraft] = useState("");
  const [customExamChips, setCustomExamChips] = useState<string[]>([]);
  const [contextMarksMap, setContextMarksMap] = useState<
    Record<string, string>
  >({});
  const lastAppliedMarksKeyRef = useRef<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const assignmentsQuery = useMyTeachingAssignments();
  const { data: assignments } = useMyTeachingAssignments();
  const { submit, isPending: isSubmitting } = useMarksSubmit();
  // 2. If not, default to the first assignment in the list
  const section = useTeacherAttendanceSection();
  const fallbackClassName =
    location.state?.class_name || section.data?.class_name || "Class";
  const fallbackSectionName =
    location.state?.section_name || section.data?.section_name || "";
  const fallbackSubjectName = location.state?.subject_name || "";
  const [selectedSectionId, setSelectedSectionId] = useState<
    number | undefined
  >(location.state?.section_id || assignments?.[0]?.section_id);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      maxMarks: "100",
      assignmentId: "",
      marks: {},
    },
    mode: "onBlur",
  });

  const watchAssignmentId = watch("assignmentId");
  const maxMarksInput = watch("maxMarks");
  const parsedMaxMarks = Number(maxMarksInput);
  const maxMarks =
    Number.isFinite(parsedMaxMarks) && parsedMaxMarks > 0
      ? parsedMaxMarks
      : 100;
  const marks = watch("marks");

  const selectedAssignment = useMemo(() => {
    const list = assignmentsQuery.data ?? [];
    return list.find(
      (a) => `${a.section_id}-${a.subject_id}` === watchAssignmentId,
    );
  }, [assignmentsQuery.data, watchAssignmentId]);
  const assignmentClassLabel =
    selectedAssignment?.class_name?.trim() || fallbackClassName;
  const assignmentSectionLabel = selectedAssignment?.section_name?.trim()
    ? selectedAssignment.section_name.trim()
    : fallbackSectionName;
  const assignmentSubjectLabel =
    selectedAssignment?.subject_name?.trim() || fallbackSubjectName;

  const studentsQuery = useStudentsBySection(selectedAssignment?.section_id);
  const buildBlankMarks = useCallback(
    () =>
      Object.fromEntries(
        (studentsQuery.data ?? []).map((s) => [String(s.id), ""]),
      ) as Record<string, string>,
    [studentsQuery.data],
  );

  // Use the existing marks hook
  const {
    data: existingMarksData,
    isLoading: loadingExistingMarks,
    isFetching: fetchingExistingMarks,
    refetch: refetchExistingMarks,
  } = useExistingMarks(
    selectedAssignment?.section_id,
    selectedAssignment?.subject_id,
    activeExamType,
  );

  const marksKey = `${selectedAssignment?.section_id ?? "na"}:${selectedAssignment?.subject_id ?? "na"}:${activeExamType || "na"}`;
  const isContextLoading = loadingExistingMarks || fetchingExistingMarks;
  const assignmentToken = selectedAssignment
    ? `${selectedAssignment.section_id}-${selectedAssignment.subject_id}`
    : "na";
  const customChipStorageKey = `vt_marks_custom_exams_${assignmentToken}`;

  const applyExamContext = (nextExamType: string) => {
    setActiveExamType(nextExamType);
    setShowCustomExamInput(false);
    lastAppliedMarksKeyRef.current = null;
    setContextMarksMap({});
    reset(
      {
        maxMarks: "100",
        assignmentId: watchAssignmentId,
        marks: buildBlankMarks(),
      },
      { keepDirty: false },
    );
  };

  const addCustomExamChip = () => {
    const normalized = normalizeExamType(customExamDraft);
    if (!normalized) return;
    setCustomExamChips((prev) => {
      if (prev.includes(normalized)) return prev;
      const next = [...prev, normalized];
      localStorage.setItem(customChipStorageKey, JSON.stringify(next));
      return next;
    });
    setShowCustomExamInput(false);
    setCustomExamDraft("");
    applyExamContext(normalized);
  };

  // Optional: Effect to sync if assignments load after initial render
  useEffect(() => {
    if (!selectedSectionId && assignments?.length) {
      setSelectedSectionId(assignments[0].section_id);
    }
  }, [assignments, selectedSectionId]);

  // Ensure assignmentId is always initialized so selectedAssignment resolves.
  useEffect(() => {
    if (!assignments?.length) return;
    if (watchAssignmentId) return;

    const stateSectionId = Number(location.state?.section_id);
    const stateSubjectName = String(location.state?.subject_name ?? "").trim();

    const fromState = assignments.find(
      (a) =>
        a.section_id === stateSectionId &&
        String(a.subject_name ?? "").trim() === stateSubjectName,
    );

    const fallback = fromState ?? assignments[0];
    if (!fallback) return;

    setValue("assignmentId", `${fallback.section_id}-${fallback.subject_id}`, {
      shouldDirty: false,
    });
  }, [assignments, location.state, setValue, watchAssignmentId]);

  useEffect(() => {
    if (!selectedAssignment) return;
    const raw = localStorage.getItem(customChipStorageKey);
    if (!raw) {
      setCustomExamChips([]);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as string[];
      const cleaned = Array.isArray(parsed)
        ? parsed
            .map((x) => normalizeExamType(String(x)))
            .filter((x) => x.length > 0)
        : [];
      setCustomExamChips(Array.from(new Set(cleaned)));
    } catch {
      setCustomExamChips([]);
    }
  }, [customChipStorageKey, selectedAssignment]);

  // Reset to default exam context when assignment changes.
  useEffect(() => {
    if (assignmentToken === "na") return;
    setActiveExamType("UNIT_TEST");
    setShowCustomExamInput(false);
    setCustomExamDraft("");
    lastAppliedMarksKeyRef.current = null;
    setContextMarksMap({});
    reset(
      {
        maxMarks: "100",
        assignmentId: watchAssignmentId,
        marks: buildBlankMarks(),
      },
      { keepDirty: false },
    );
  }, [assignmentToken, reset, watchAssignmentId, buildBlankMarks]);

  // Load existing marks for the active context only after fetch settles.
  useEffect(() => {
    if (!selectedAssignment || fetchingExistingMarks) return;
    if (lastAppliedMarksKeyRef.current === marksKey) return;

    const nextMarksMap = existingMarksData?.marksMap ?? {};
    const nextMaxMarks =
      typeof existingMarksData?.maxMarks === "number"
        ? existingMarksData.maxMarks
        : null;

    setContextMarksMap(nextMarksMap);

    // Explicitly resetting ensures the form state is wiped clean before
    // being populated with the new (or empty) marks map.
    reset(
      {
        maxMarks: nextMaxMarks ? String(nextMaxMarks) : "100",
        assignmentId: watchAssignmentId,
        marks:
          Object.keys(nextMarksMap).length > 0
            ? nextMarksMap
            : buildBlankMarks(),
      },
      { keepDirty: false },
    );

    lastAppliedMarksKeyRef.current = marksKey;
  }, [
    selectedAssignment,
    fetchingExistingMarks,
    marksKey,
    existingMarksData,
    reset,
    watchAssignmentId,
    buildBlankMarks,
  ]);

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
  }, [isDirty, marks, watchAssignmentId, activeExamType]);

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
    // 1. Validation guard: Ensure we have the form data and the assignment context
    if (!formData || !selectedAssignment) {
      logger.warn(
        "[teacher][marks] attempt to submit without data or assignment selection",
      );
      return;
    }

    // 2. Resolve exam type code for backend/storage.
    const examTypeDto = normalizeExamType(activeExamType);
    if (!examTypeDto) return;

    // 3. Extract and sanitize student marks
    const entries = (studentsQuery.data ?? [])
      .map((s) => {
        // Get value from form state, defaulting to empty string if missing
        const raw = formData.marks?.[String(s.id)] ?? "";
        const trimmed = String(raw).trim();

        // Only include students who actually have a mark entered
        if (!trimmed) return null;

        const n = Number(trimmed);

        // Final safety check: skip if the mark isn't a valid number
        if (!Number.isFinite(n)) return null;

        return { studentId: s.id, marks: n };
      })
      .filter(
        (entry): entry is { studentId: number; marks: number } =>
          entry !== null,
      );

    // 4. Validate subject identity before proceeding
    if (!selectedAssignment.subject_id) {
      logger.error("[teacher][marks] missing subject_id in assignment object", {
        assignmentId: formData.assignmentId,
      });
      return;
    }

    // 5. Trigger the submission
    // Note: 'submit' here is the mutate function from useMarksSubmit
    submit(
      {
        sectionId: selectedAssignment.section_id,
        subjectId: selectedAssignment.subject_id,
        examType: examTypeDto,
        maxMarks,
        students: entries,
        concurrency: 8, // Optional: defaults to 8 in the hook
      },
      {
        onSuccess: () => {
          // Close the confirmation modal
          setShowConfirmModal(false);

          // Refresh the local cache of marks
          refetchExistingMarks();

          // Redirect to dashboard with success state
          navigate("/teacher", {
            replace: true,
            state: {
              toast: `Marks submitted successfully for the subject ${selectedAssignment.subject_name} - (${selectedAssignment.class_name} ${selectedAssignment.section_name})`,
            },
          });
        },
        onError: (err) => {
          // Log failure but keep modal open so teacher doesn't lose data
          logger.error("[teacher][marks] submission failed", { err });
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
  const hasValidExamType = normalizeExamType(activeExamType).length > 0;

  // Check if there are existing marks
  const existingMarksMap = contextMarksMap as Record<string, string>;
  const hasExistingMarks = Object.keys(existingMarksMap).length > 0;
  const existingMarksCount = hasExistingMarks
    ? Object.keys(existingMarksMap).length
    : 0;
  const lockMaxMarks = hasExistingMarks;

  const filteredStudents = useMemo(() => {
    const list = studentsQuery.data ?? [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((s, idx) => {
      const name = String(s.name ?? "").toLowerCase();
      const roll =
        s.roll_no != null ? String(s.roll_no).toLowerCase() : String(idx + 1);
      return name.includes(q) || roll.includes(q);
    });
  }, [studentsQuery.data, searchQuery]);
  const showStudentRows = !isContextLoading && filteredStudents.length > 0;

  // Replace the entire return statement from the Enter Marks component

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between md:mb-6">
          <button
            onClick={() => navigate("/teacher")}
            className="text-blue-600 font-bold text-sm flex items-center gap-1"
          >
            <span className="text-lg">←</span> BACK
          </button>
          <div className="text-sm font-bold text-gray-800 tracking-tight md:tracking-widest md:uppercase md:text-gray-400">
            Enter Marks
          </div>
          <div className="hidden md:block w-16" />
        </div>
        <h1 className="mb-5 text-2xl font-extrabold text-gray-900 md:mb-8 md:text-3xl">
          Enter Marks
        </h1>
        {/* Existing Marks Notification */}
        {isContextLoading && selectedAssignment && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-700">
              Loading exam context...
            </span>
          </div>
        )}

        {hasExistingMarks && !isContextLoading && (
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

        {/* Form */}
        <form
          onSubmit={handleSubmit((values) => handleOpenConfirmation(values))}
        >
          {/* Selection Panel */}
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:mt-6 md:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-900 md:text-base">
                  Class & Subject
                </label>
                <div className="mt-2 flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>
                    {assignmentClassLabel}
                    {assignmentSectionLabel
                      ? ` - ${assignmentSectionLabel}`
                      : ""}
                    {assignmentSubjectLabel
                      ? ` • ${assignmentSubjectLabel}`
                      : ""}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 md:text-base">
                  Maximum Marks
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-3">
                  <Ruler className="h-5 w-5 text-blue-600" />
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    inputMode="numeric"
                    className="w-full bg-transparent text-base font-semibold text-gray-900 outline-none md:text-sm"
                    disabled={lockMaxMarks || isContextLoading}
                    {...register("maxMarks", {
                      required: "Maximum marks is required",
                      validate: (v) =>
                        Number(v) > 0 || "Maximum marks must be greater than 0",
                    })}
                  />
                </div>
                <p
                  className={`mt-1 text-xs leading-relaxed ${lockMaxMarks ? "text-red-500" : "text-gray-500"}`}
                >
                  This exam is scored out of {maxMarks}.
                  {lockMaxMarks
                    ? " Maximum marks is locked because marks already exist for this exam."
                    : ""}
                </p>
                {errors.maxMarks ? (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.maxMarks.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <label className="block text-sm font-semibold text-gray-900 md:text-base">
                Assessment Type
              </label>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {EXAM_TYPE_PRESETS.map((preset) => {
                  const active = activeExamType === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => applyExamContext(preset.value)}
                      className={[
                        "rounded-full border px-3.5 py-2 text-sm font-semibold transition",
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:text-blue-700",
                      ].join(" ")}
                    >
                      {preset.label}
                    </button>
                  );
                })}
                {customExamChips.map((chip) => {
                  const active = activeExamType === chip;
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => applyExamContext(chip)}
                      className={[
                        "rounded-full border px-3.5 py-2 text-sm font-semibold transition",
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:text-blue-700",
                      ].join(" ")}
                    >
                      {prettyExamType(chip)}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowCustomExamInput((v) => !v)}
                  className={[
                    "rounded-full border px-3.5 py-2 text-sm font-semibold transition",
                    showCustomExamInput
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:text-blue-700",
                  ].join(" ")}
                >
                  + Add Exam
                </button>
              </div>
              {showCustomExamInput ? (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="e.g. PRE_BOARD_1 or Formative Assessment 1"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    value={customExamDraft}
                    onChange={(e) => setCustomExamDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomExamChip();
                      }
                    }}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addCustomExamChip}
                      className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Add Exam
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomExamInput(false);
                        setCustomExamDraft("");
                      }}
                      className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Student List Card */}
          {selectedAssignment && (
            <div className="mb-6 mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {/* Card Header */}
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
                        <span className="text-gray-900">
                          {prettyExamType(activeExamType)}
                        </span>{" "}
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
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm md:w-auto">
                      <Search className="h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search student..."
                        className="w-full bg-transparent text-sm font-medium text-gray-700 outline-none placeholder:text-gray-400 md:w-48"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Students List */}
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
                {showStudentRows &&
                  filteredStudents.map((s, idx) => {
                    const key = String(s.id);
                    const rollNo =
                      s.roll_no != null ? String(s.roll_no) : String(idx + 1);
                    const hasMark = marks[key]?.trim() !== "";
                    const isExistingMark = existingMarksMap[key] !== undefined;

                    return (
                      <li
                        key={s.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-12 md:items-center md:gap-3 md:px-6">
                          {/* Roll Number */}
                          <div className="md:col-span-2">
                            <div className="inline-flex items-center justify-center rounded-full bg-gray-100 px-3 py-1.5">
                              <span className="text-sm font-semibold text-gray-700">
                                {rollNo}
                              </span>
                            </div>
                          </div>

                          {/* Student Name */}
                          <div className="md:col-span-7">
                            <div className="flex items-center gap-2">
                              <div className="text-base font-semibold text-gray-900 md:text-sm">
                                {s.name}
                              </div>
                              {isExistingMark && !hasMark && (
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                  Previously: {existingMarksMap[key]}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Marks Input */}
                          <div className="md:col-span-3 md:flex md:justify-end">
                            <div className="relative w-full md:max-w-[220px]">
                              <input
                                type="tel"
                                inputMode="numeric"
                                disabled={isContextLoading}
                                placeholder={
                                  isExistingMark ? existingMarksMap[key] : "—"
                                }
                                className={`
                                h-14 w-full rounded-xl border bg-white pl-4 pr-16 text-right text-base font-semibold text-gray-900 outline-none focus:ring-2 md:h-12 md:text-sm
                                ${hasMark ? "border-green-300 bg-green-50/30" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}
                                ${isExistingMark && !hasMark ? "border-blue-200 bg-blue-50/30" : ""}
                              `}
                                {...register(`marks.${key}` as const, {
                                  validate: (v) =>
                                    isValidMark(v, maxMarks) ||
                                    `Enter 0–${maxMarks}`,
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
                              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-gray-400 md:right-3 md:text-xs">
                                /{maxMarks}
                              </span>
                            </div>
                          </div>
                        </div>

                        {errors.marks && (errors.marks as any)[key] && (
                          <div className="px-4 pb-3 text-right text-sm text-red-600 md:px-6">
                            {(errors.marks as any)[key]?.message ??
                              "Invalid mark"}
                          </div>
                        )}
                      </li>
                    );
                  })}
              </ul>

              {/* Card Footer */}
              <div className="border-t border-gray-200 px-4 py-4 md:px-6">
                <div className="flex flex-col gap-2 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
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
          <div className="sticky bottom-0 z-10 mt-2 flex gap-3 border-t border-gray-200 bg-gray-50/95 px-0 py-3 backdrop-blur md:static md:mt-0 md:justify-end md:border-0 md:bg-transparent md:py-0">
            <button
              type="button"
              onClick={handleSubmit(handleSaveDraft)}
              disabled={!isDirty || isAutoSaving}
              className="h-12 flex-1 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:px-6"
            >
              {isAutoSaving ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                isContextLoading ||
                filledMarks === 0 ||
                !hasValidExamType
              }
              className="h-12 flex-[1.25] rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:px-8"
            >
              {isSubmitting ? "Submitting..." : "Submit Marks"}
            </button>
          </div>
        </form>

        {/* Completion Status */}
        {completionPercentage === 100 && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
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
                  <span className="block mt-1">
                    Maximum marks for this exam: <strong>{maxMarks}</strong>.
                  </span>
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
                    After submission, marks can be corrected for 7 days. After
                    that, marks are locked and changes require admin approval.
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
