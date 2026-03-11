/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";

import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections";
import { useStudentsBySectionDetailed } from "@/hooks/useStudentsBySectionDetailed";
import { useSubjects } from "@/hooks/useSubjects";
import { useAuthStore } from "@/store/auth.store";
import { logger } from "@/utils/logger";

import { usePrincipalCommunicationsDelivery } from "./usePrincipalCommunicationsDelivery";
import { usePrincipalCommunicationsNotes } from "./usePrincipalCommunicationsNotes";
import type {
  PrincipalCommunicationsState,
  PrincipalCommunicationsTabKey,
  PrincipalStudent,
} from "../types/principalCommunications.types";

export function usePrincipalCommunications(): PrincipalCommunicationsState {
  const trace = useMemo(() => logger.traceId(), []);
  const schoolId = useAuthStore((state) => state.schoolId);

  const classesQuery = useClasses();
  const sectionsQuery = useSections();
  const subjectsQuery = useSubjects();
  const classes = useMemo(() => classesQuery.list.data ?? [], [classesQuery.list.data]);
  const sections = useMemo(
    () => sectionsQuery.list.data ?? [],
    [sectionsQuery.list.data],
  );
  const subjects = useMemo(() => subjectsQuery.data ?? [], [subjectsQuery.data]);

  const [activeTab, setActiveTab] =
    useState<PrincipalCommunicationsTabKey>("homework");
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [selectedSectionId, setSelectedSectionId] = useState<number | "">("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");

  useEffect(() => {
    if (!selectedClassId && classes.length) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const filteredSections = useMemo(
    () => sections.filter((section) => section.class_id === selectedClassId),
    [sections, selectedClassId],
  );

  useEffect(() => {
    if (!selectedClassId) return;
    if (!filteredSections.length) {
      setSelectedSectionId("");
      return;
    }
    if (!filteredSections.some((section) => section.id === selectedSectionId)) {
      setSelectedSectionId(filteredSections[0].id);
    }
  }, [filteredSections, selectedClassId, selectedSectionId]);

  useEffect(() => {
    if (!subjects.length) {
      setSelectedSubjectId("");
      return;
    }
    if (!selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const sectionId =
    typeof selectedSectionId === "number" ? selectedSectionId : undefined;
  const subjectId =
    typeof selectedSubjectId === "number" ? selectedSubjectId : undefined;

  const studentsQuery = useStudentsBySectionDetailed(sectionId);

  const parentStudents = useMemo(
    () => ((studentsQuery.data ?? []) as PrincipalStudent[]),
    [studentsQuery.data],
  );

  const resetKey = `${selectedSectionId}-${selectedSubjectId}`;
  const notes = usePrincipalCommunicationsNotes({
    trace,
    schoolId,
    sectionId,
    subjectId,
    parentStudents,
    resetKey,
  });
  const delivery = usePrincipalCommunicationsDelivery({
    sectionId,
    subjectId,
    parentStudents,
    resetKey,
  });

  return {
    activeTab,
    setActiveTab,
    selectedClassId,
    setSelectedClassId,
    selectedSectionId,
    setSelectedSectionId,
    selectedSubjectId,
    setSelectedSubjectId,
    classes,
    sections,
    subjects,
    filteredSections,
    studentsCount: parentStudents.length,
    loadingSetup:
      classesQuery.list.isLoading ||
      sectionsQuery.list.isLoading ||
      subjectsQuery.isLoading,
    setupError:
      Boolean(classesQuery.list.error) ||
      Boolean(sectionsQuery.list.error) ||
      Boolean(subjectsQuery.error),
    isSetupComplete: Boolean(classes.length && sections.length && subjects.length),
    parentStudents,
    ...delivery,
    ...notes,
  };
}
