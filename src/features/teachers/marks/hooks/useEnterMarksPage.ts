import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

import { useExistingMarks } from "@/hooks/useExistingMarks";
import { useMarksSubmit } from "@/hooks/useMarksSubmit";
import { useMyTeachingAssignments } from "@/hooks/useMyTeachingAssignments";
import { useStudentsBySection } from "@/hooks/useStudentsBySection";
import { useTeacherAttendanceSection } from "@/hooks/useTeacherAttendanceSection";
import { logger } from "@/utils/logger";
import { normalizeExamType } from "@/helpers/exams";

import { buildBlankMarks, filterStudentsByQuery, getAssignmentToken, getCustomChipStorageKey } from "../utils/enterMarks.utils";
import type { EnterMarksState, FormValues } from "../types/enterMarks.types";

const EMPTY_MARKS: Record<string, string> = {};

export function useEnterMarksPage(): EnterMarksState & { isDirty: boolean } {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeExamType, setActiveExamType] = useState<string>("UNIT_TEST");
  const [showCustomExamInput, setShowCustomExamInput] = useState(false);
  const [customExamDraft, setCustomExamDraft] = useState("");
  const [customExamChips, setCustomExamChips] = useState<string[]>([]);
  const [contextMarksMap, setContextMarksMap] = useState<Record<string, string>>({});
  const lastAppliedMarksKeyRef = useRef<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const assignmentsQuery = useMyTeachingAssignments();
  const assignments = assignmentsQuery.data;
  const { submit, isPending: isSubmitting } = useMarksSubmit();
  const section = useTeacherAttendanceSection();
  const fallbackClassName =
    location.state?.class_name || section.data?.class_name || "Class";
  const fallbackSectionName =
    location.state?.section_name || section.data?.section_name || "";
  const fallbackSubjectName = location.state?.subject_name || "";

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      maxMarks: "100",
      assignmentId: "",
      marks: {},
    },
    mode: "onBlur",
  });

  const watchAssignmentId = useWatch({ control, name: "assignmentId" }) ?? "";
  const maxMarksInput = useWatch({ control, name: "maxMarks" }) ?? "100";
  const parsedMaxMarks = Number(maxMarksInput);
  const maxMarks =
    Number.isFinite(parsedMaxMarks) && parsedMaxMarks > 0 ? parsedMaxMarks : 100;
  const watchedMarks = useWatch({ control, name: "marks" });
  const marks = watchedMarks ?? EMPTY_MARKS;

  const selectedAssignment = useMemo(() => {
    const list = assignmentsQuery.data ?? [];
    return list.find(
      (assignment) =>
        `${assignment.section_id}-${assignment.subject_id}` === watchAssignmentId,
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
  const buildBlankMarksForStudents = useCallback(
    () => buildBlankMarks(studentsQuery.data ?? []),
    [studentsQuery.data],
  );

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
  const assignmentToken = getAssignmentToken(selectedAssignment);
  const customChipStorageKey = getCustomChipStorageKey(assignmentToken);

  const applyExamContext = (nextExamType: string) => {
    setActiveExamType(nextExamType);
    setShowCustomExamInput(false);
    lastAppliedMarksKeyRef.current = null;
    setContextMarksMap({});
    reset(
      {
        maxMarks: "100",
        assignmentId: watchAssignmentId,
        marks: buildBlankMarksForStudents(),
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

  useEffect(() => {
    if (!assignments?.length) return;
    if (watchAssignmentId) return;

    const stateSectionId = Number(location.state?.section_id);
    const stateSubjectName = String(location.state?.subject_name ?? "").trim();

    const fromState = assignments.find(
      (assignment) =>
        assignment.section_id === stateSectionId &&
        String(assignment.subject_name ?? "").trim() === stateSubjectName,
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCustomExamChips([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as string[];
      const cleaned = Array.isArray(parsed)
        ? parsed
            .map((value) => normalizeExamType(String(value)))
            .filter((value) => value.length > 0)
        : [];
      setCustomExamChips(Array.from(new Set(cleaned)));
    } catch {
      setCustomExamChips([]);
    }
  }, [customChipStorageKey, selectedAssignment]);

  useEffect(() => {
    if (assignmentToken === "na") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveExamType("UNIT_TEST");
    setShowCustomExamInput(false);
    setCustomExamDraft("");
    lastAppliedMarksKeyRef.current = null;
    setContextMarksMap({});
    reset(
      {
        maxMarks: "100",
        assignmentId: watchAssignmentId,
        marks: buildBlankMarksForStudents(),
      },
      { keepDirty: false },
    );
  }, [assignmentToken, reset, watchAssignmentId, buildBlankMarksForStudents]);

  useEffect(() => {
    if (!selectedAssignment || fetchingExistingMarks) return;
    if (lastAppliedMarksKeyRef.current === marksKey) return;

    const nextMarksMap = existingMarksData?.marksMap ?? {};
    const nextMaxMarks =
      typeof existingMarksData?.maxMarks === "number"
        ? existingMarksData.maxMarks
        : null;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContextMarksMap(nextMarksMap);
    reset(
      {
        maxMarks: nextMaxMarks ? String(nextMaxMarks) : "100",
        assignmentId: watchAssignmentId,
        marks:
          Object.keys(nextMarksMap).length > 0
            ? nextMarksMap
            : buildBlankMarksForStudents(),
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
    buildBlankMarksForStudents,
  ]);

  useEffect(() => {
    if (!isDirty) return;

    const timeoutId = setTimeout(() => {
      setIsAutoSaving(true);
      setAutoSaveStatus("saving");

      setTimeout(() => {
        setIsAutoSaving(false);
        setAutoSaveStatus("saved");

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
    if (!formData || !selectedAssignment) {
      logger.warn(
        "[teacher][marks] attempt to submit without data or assignment selection",
      );
      return;
    }

    const examTypeDto = normalizeExamType(activeExamType);
    if (!examTypeDto) return;

    const entries = (studentsQuery.data ?? [])
      .map((student) => {
        const raw = formData.marks?.[String(student.id)] ?? "";
        const trimmed = String(raw).trim();
        if (!trimmed) return null;

        const numberValue = Number(trimmed);
        if (!Number.isFinite(numberValue)) return null;

        return { studentId: student.id, marks: numberValue };
      })
      .filter(
        (entry): entry is { studentId: number; marks: number } => entry !== null,
      );

    if (!selectedAssignment.subject_id) {
      logger.error("[teacher][marks] missing subject_id in assignment object", {
        assignmentId: formData.assignmentId,
      });
      return;
    }

    submit(
      {
        sectionId: selectedAssignment.section_id,
        subjectId: selectedAssignment.subject_id,
        examType: examTypeDto,
        maxMarks,
        students: entries,
        concurrency: 8,
      },
      {
        onSuccess: () => {
          setShowConfirmModal(false);
          refetchExistingMarks();
          navigate("/teacher", {
            replace: true,
            state: {
              toast: `Marks submitted successfully for the subject ${selectedAssignment.subject_name} - (${selectedAssignment.class_name} ${selectedAssignment.section_name})`,
            },
          });
        },
        onError: (err) => {
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
  const existingMarksMap = contextMarksMap as Record<string, string>;
  const hasExistingMarks = Object.keys(existingMarksMap).length > 0;
  const existingMarksCount = hasExistingMarks
    ? Object.keys(existingMarksMap).length
    : 0;
  const lockMaxMarks = hasExistingMarks;
  const filteredStudents = useMemo(
    () => filterStudentsByQuery(studentsQuery.data ?? [], searchQuery),
    [studentsQuery.data, searchQuery],
  );
  const showStudentRows = !isContextLoading && filteredStudents.length > 0;

  return {
    assignmentClassLabel,
    assignmentSectionLabel,
    assignmentSubjectLabel,
    selectedAssignment,
    activeExamType,
    showCustomExamInput,
    customExamDraft,
    customExamChips,
    setShowCustomExamInput,
    setCustomExamDraft,
    addCustomExamChip,
    applyExamContext,
    searchQuery,
    setSearchQuery,
    isAutoSaving,
    showConfirmModal,
    setShowConfirmModal,
    isSubmitting,
    loadingExistingMarks,
    fetchingExistingMarks,
    isContextLoading,
    hasExistingMarks,
    existingMarksCount,
    existingMarksMap,
    lockMaxMarks,
    totalStudents,
    filledMarks,
    completionPercentage,
    hasValidExamType,
    filteredStudents,
    showStudentRows,
    maxMarks,
    errors,
    register,
    handleSubmit,
    reset,
    setValue,
    watchAssignmentId,
    marks,
    handleSaveDraft,
    handleOpenConfirmation,
    handleFinalSubmit,
    isDirty,
  };
}
