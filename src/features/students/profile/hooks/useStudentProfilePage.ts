import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { getStudentProfile, getStudentReportCard } from "@/api/students.api";
import { queryKeys } from "@/constants/queryKeys";
import { useStudentNotes } from "@/hooks/useStudentNotes";
import { useAuthStore } from "@/store/auth.store";
import type {
  StudentAttendanceSummary,
  StudentGuardian,
  StudentPersonalDetails,
  StudentProfileDto,
  StudentRecentResult,
} from "@/types/student.types";
import type { StudentNoteDto } from "@/types/studentNotes.types";
import { logger } from "@/utils/logger";

import {
  buildFallbackReportCard,
  getHeaderClassSection,
  groupRecentResults,
} from "../helpers/studentProfile.helpers";
import type { StudentProfileHookState } from "../types/studentProfile.types";
import {
  buildReportCardHtml,
  getReportLoadingHtml,
} from "../utils/studentProfile.utils";

export function useStudentProfilePage(): StudentProfileHookState {
  const trace = useMemo(() => logger.traceId(), []);
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const studentId = params.studentId ?? "";
  const schoolId = useAuthStore((state) => state.schoolId);
  const schools = useAuthStore((state) => state.schools);
  const effectiveSchoolId = schoolId ?? schools[0]?.id ?? null;
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [notesClassFilter, setNotesClassFilter] = useState("all");

  const studentQuery = useQuery({
    queryKey: queryKeys.studentProfile(studentId, effectiveSchoolId),
    enabled: !!studentId && !!effectiveSchoolId,
    retry: 1,
    queryFn: () => getStudentProfile(studentId, effectiveSchoolId!),
  });

  const notesQuery = useStudentNotes(studentId);
  const notes = useMemo(
    () => (notesQuery.data ?? []) as StudentNoteDto[],
    [notesQuery.data],
  );
  const notesClassOptions = useMemo(() => {
    const options = new Set<string>();
    notes.forEach((note) => {
      if (note.class_name) options.add(note.class_name);
    });
    return Array.from(options).sort();
  }, [notes]);
  const filteredNotes = useMemo(() => {
    if (notesClassFilter === "all") return notes;
    return notes.filter((note) => note.class_name === notesClassFilter);
  }, [notes, notesClassFilter]);

  const studentName = (studentQuery.data as StudentProfileDto | undefined)?.name;
  useEffect(() => {
    if (!studentName) return;
    navigate(location.pathname, {
      replace: true,
      state: { breadcrumbLabel: studentName },
    });
  }, [studentName, navigate, location.pathname]);

  const student = (studentQuery.data ?? null) as StudentProfileDto | null;
  const personal = (student?.personal_details ?? null) as StudentPersonalDetails | null;
  const guardians = (student?.guardians ?? []) as StudentGuardian[];
  const attendance = (student?.attendance ?? null) as StudentAttendanceSummary | null;
  const recentResults = useMemo(
    () => ((student?.recent_results ?? []) as StudentRecentResult[]),
    [student?.recent_results],
  );
  const groupedRecentResults = useMemo(
    () => groupRecentResults(recentResults),
    [recentResults],
  );
  const headerClassSection = student ? getHeaderClassSection(student) : "—";

  const generateReportCard = async () => {
    if (!student || !effectiveSchoolId) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(getReportLoadingHtml());
    printWindow.document.close();

    try {
      setIsGeneratingReport(true);
      const report = await getStudentReportCard(studentId, effectiveSchoolId);
      printWindow.document.open();
      printWindow.document.write(buildReportCardHtml(report));
      printWindow.document.close();
      printWindow.focus();
    } catch {
      const fallbackReport = buildFallbackReportCard({
        student,
        recentResults,
        attendance,
      });
      printWindow.document.open();
      printWindow.document.write(buildReportCardHtml(fallbackReport));
      printWindow.document.close();
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (student) {
    logger.info("[student-profile] loaded", { trace, studentId });
  }

  return {
    studentId,
    effectiveSchoolId,
    student: student ?? ({} as StudentProfileDto),
    personal,
    guardians,
    attendance,
    recentResults,
    groupedRecentResults,
    headerClassSection,
    notes,
    notesClassFilter,
    setNotesClassFilter,
    notesClassOptions,
    filteredNotes,
    isGeneratingReport,
    isLoading: studentQuery.isLoading,
    hasError: Boolean(studentQuery.error) || !student,
    notesLoading: notesQuery.isLoading,
    notesError: Boolean(notesQuery.error),
    generateReportCard,
  };
}
