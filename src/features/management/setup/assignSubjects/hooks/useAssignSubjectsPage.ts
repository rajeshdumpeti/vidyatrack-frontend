import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import { createSection } from "@/api/sections.api";
import { createTeachingAssignment } from "@/api/teachingAssignments.api";
import {
  useCreateTeachingAssignment,
  useTeachingAssignments,
} from "@/hooks/useTeachingAssignments";
import { useAuthStore } from "@/store/auth.store";
import { logger } from "@/utils/logger";

import {
  getFriendlyAssignError,
  getTeacherLabel,
} from "../helpers/assignSubjects.helpers";
import type {
  AssignSubjectsClassDto,
  AssignSubjectsRowMessage,
  AssignSubjectsSectionDto,
  AssignSubjectsSubjectDto,
  AssignSubjectsTeacherDto,
  HistoryTarget,
} from "../types/assignSubjects.types";

export function useAssignSubjectsPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const { schoolId } = useAuthStore();
  const queryClient = useQueryClient();

  const [classId, setClassId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [selectedTeacherBySubject, setSelectedTeacherBySubject] = useState<
    Record<number, number | "">
  >({});
  const [rowMessage, setRowMessage] = useState<AssignSubjectsRowMessage>({});
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const [recentlyCompletedSubjectId, setRecentlyCompletedSubjectId] = useState<
    number | null
  >(null);
  const [historyTarget, setHistoryTarget] = useState<HistoryTarget | null>(null);

  const classesQuery = useQuery({
    queryKey: ["classes", schoolId],
    queryFn: async () => {
      const response = await apiClient.get<AssignSubjectsClassDto[]>(
        API_ENDPOINTS.classes.list,
        { params: { school_id: schoolId } },
      );
      return response.data;
    },
    enabled: !!schoolId,
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects", schoolId],
    queryFn: async () => {
      const response = await apiClient.get<AssignSubjectsSubjectDto[]>(
        API_ENDPOINTS.subjects.list,
        { params: { school_id: schoolId } },
      );
      return response.data;
    },
    enabled: !!schoolId,
  });

  const teachersQuery = useQuery({
    queryKey: ["teachers", schoolId],
    queryFn: async () => {
      const response = await apiClient.get<
        { data: AssignSubjectsTeacherDto[] } | AssignSubjectsTeacherDto[]
      >(API_ENDPOINTS.teachers.list, { params: { school_id: schoolId } });
      const payload = response.data;
      return Array.isArray(payload) ? payload : (payload.data ?? []);
    },
    enabled: !!schoolId,
  });

  const sectionsQuery = useQuery({
    queryKey: ["sections", schoolId, { classId }],
    queryFn: async () => {
      const response = await apiClient.get<AssignSubjectsSectionDto[]>(
        API_ENDPOINTS.sections.list,
        { params: { school_id: schoolId, class_id: classId } },
      );
      return response.data;
    },
    enabled: !!schoolId && !!classId,
  });

  const createDefaultSectionMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId || !classId) throw new Error("missing_context");
      return createSection({
        school_id: schoolId,
        class_id: classId,
        name: "General",
      });
    },
    onSuccess: async (section) => {
      await queryClient.invalidateQueries({
        queryKey: ["sections", schoolId, { classId }],
      });
      setSectionId(section.id);
      logger.info("[assign] default_section_created", {
        trace,
        schoolId,
        classId,
        sectionId: section.id,
      });
    },
  });

  const { data: assignments } = useTeachingAssignments(sectionId);
  const createMutation = useCreateTeachingAssignment();

  const classes = useMemo(() => classesQuery.data ?? [], [classesQuery.data]);
  const sections = useMemo(
    () => sectionsQuery.data ?? [],
    [sectionsQuery.data],
  );
  const subjects = useMemo(
    () => subjectsQuery.data ?? [],
    [subjectsQuery.data],
  );
  const teachers = useMemo(
    () => teachersQuery.data ?? [],
    [teachersQuery.data],
  );
  const selectedClass = classes.find((item) => item.id === classId);
  const noSectionsForClass =
    !!classId && !sectionsQuery.isLoading && sections.length === 0;

  const assignedTeacherIdBySubject = useMemo(() => {
    const map: Record<number, number> = {};
    assignments.forEach((assignment) => {
      map[assignment.subject_id] = assignment.teacher_id;
    });
    return map;
  }, [assignments]);

  const substituteTeacherIdBySubject = useMemo(() => {
    const map: Record<number, number> = {};
    assignments.forEach((assignment) => {
      if (assignment.substitute_teacher_id) {
        map[assignment.subject_id] = assignment.substitute_teacher_id;
      }
    });
    return map;
  }, [assignments]);

  const pendingAssignments = useMemo(
    () =>
      subjects
        .map((subject) => {
          const teacherId = selectedTeacherBySubject[subject.id];
          if (!teacherId || typeof teacherId !== "number") return null;
          if (assignedTeacherIdBySubject[subject.id] === teacherId) return null;
          return {
            subjectId: subject.id,
            teacherId,
          };
        })
        .filter((row): row is { subjectId: number; teacherId: number } =>
          Boolean(row),
        ),
    [assignedTeacherIdBySubject, selectedTeacherBySubject, subjects],
  );

  useEffect(() => {
    if (!recentlyCompletedSubjectId) return;
    const timeoutId = window.setTimeout(
      () => setRecentlyCompletedSubjectId(null),
      900,
    );
    return () => window.clearTimeout(timeoutId);
  }, [recentlyCompletedSubjectId]);

  const onClassChange = (nextClassId: number | null) => {
    setClassId(nextClassId);
    setSectionId(null);
    setSelectedTeacherBySubject({});
    setRowMessage({});
  };

  const onSectionChange = (nextSectionId: number | null) => {
    setSectionId(nextSectionId);
    setSelectedTeacherBySubject({});
    setRowMessage({});
  };

  const onTeacherChange = (subjectId: number, teacherId: number | "") => {
    setSelectedTeacherBySubject((prev) => ({
      ...prev,
      [subjectId]: teacherId,
    }));
  };

  const assignForSubject = (subjectId: number) => {
    if (!sectionId) return;
    const teacherId = selectedTeacherBySubject[subjectId];

    if (!teacherId || typeof teacherId !== "number") {
      setRowMessage((prev) => ({
        ...prev,
        [subjectId]: { text: "Select teacher first.", type: "error" },
      }));
      return;
    }

    setBulkMessage(null);
    createMutation.mutate(
      { section_id: sectionId, subject_id: subjectId, teacher_id: teacherId },
      {
        onSuccess: () => {
          setRowMessage((prev) => ({
            ...prev,
            [subjectId]: { text: "Assigned successfully.", type: "success" },
          }));
          setRecentlyCompletedSubjectId(subjectId);
          logger.info("[assign] success", { trace, subjectId, teacherId });
        },
        onError: (error) => {
          setRowMessage((prev) => ({
            ...prev,
            [subjectId]: {
              text: getFriendlyAssignError(error),
              type: "error",
            },
          }));
        },
      },
    );
  };

  const onSaveAll = async () => {
    if (!schoolId || !sectionId || pendingAssignments.length === 0) return;
    const shouldProceed = window.confirm(
      `Apply ${pendingAssignments.length} subject assignments now?`,
    );
    if (!shouldProceed) return;

    setBulkSaving(true);
    setBulkMessage(null);

    const results = await Promise.allSettled(
      pendingAssignments.map((row) =>
        createTeachingAssignment({
          school_id: schoolId,
          section_id: sectionId,
          subject_id: row.subjectId,
          teacher_id: row.teacherId,
        }),
      ),
    );

    let successCount = 0;
    let failCount = 0;
    results.forEach((result, index) => {
      const subjectId = pendingAssignments[index].subjectId;
      if (result.status === "fulfilled") {
        successCount += 1;
        setRowMessage((prev) => ({
          ...prev,
          [subjectId]: { text: "Assigned successfully.", type: "success" },
        }));
        setRecentlyCompletedSubjectId(subjectId);
      } else {
        failCount += 1;
        setRowMessage((prev) => ({
          ...prev,
          [subjectId]: {
            text: getFriendlyAssignError(result.reason),
            type: "error",
          },
        }));
      }
    });

    await queryClient.invalidateQueries({
      queryKey: ["teaching-assignments", schoolId, { sectionId }],
    });

    setBulkMessage(
      failCount === 0
        ? `${successCount} assignments saved successfully.`
        : `${successCount} saved, ${failCount} failed.`,
    );
    setBulkSaving(false);
  };

  const isLoading = classesQuery.isLoading || subjectsQuery.isLoading;

  return {
    classes,
    sections,
    subjects,
    teachers,
    classId,
    sectionId,
    selectedClass,
    noSectionsForClass,
    selectedTeacherBySubject,
    assignedTeacherIdBySubject,
    substituteTeacherIdBySubject,
    rowMessage,
    bulkSaving,
    bulkMessage,
    recentlyCompletedSubjectId,
    pendingAssignmentsCount: pendingAssignments.length,
    classesQuery,
    sectionsQuery,
    subjectsQuery,
    teachersQuery,
    createMutation,
    createDefaultSectionMutation,
    teacherName: getTeacherLabel,
    onClassChange,
    onSectionChange,
    onTeacherChange,
    assignForSubject,
    onSaveAll,
    isLoading,
    historyTarget,
    setHistoryTarget,
  };
}
