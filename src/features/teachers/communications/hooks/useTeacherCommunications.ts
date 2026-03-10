import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { createStudentNote, getStudentNotes } from "@/api/studentNotes.api";
import { useTeacherAttendanceSection } from "@/hooks/useTeacherAttendanceSection";
import { useHomeworkHistory } from "@/hooks/useHomeworkHistory";
import { useMyTeachingAssignments } from "@/hooks/useMyTeachingAssignments";
import { useParentMessagesHistory } from "@/hooks/useParentMessagesHistory";
import { useSendHomework } from "@/hooks/useSendHomework";
import { useSendParentMessage } from "@/hooks/useSendParentMessage";
import { useStudentsBySectionDetailed } from "@/hooks/useStudentsBySectionDetailed";
import { useAuthStore } from "@/store/auth.store";
import type { HomeworkRecordDto, ParentMessageRecordDto } from "@/types/communications.types";
import type { StudentNoteDto } from "@/types/studentNotes.types";
import { logger } from "@/utils/logger";

import {
  findInitialAssignment,
  matchesNoteStudentSearch,
  matchesParentSearch,
  toAssignmentKey,
} from "../helpers/teacherCommunications.helpers";
import {
  normalizeStudentNotes,
} from "../utils/teacherCommunications.utils";
import type {
  ParentStudent,
  TabKey,
  TeacherCommunicationsNavigationState,
  TeacherCommunicationsState,
} from "../types/teacherCommunications.types";

export function useTeacherCommunications(): TeacherCommunicationsState {
  const location = useLocation();
  const trace = useMemo(() => logger.traceId(), []);
  const schoolId = useAuthStore((state) => state.schoolId);
  const navigationState =
    (location.state as TeacherCommunicationsNavigationState | null) ?? null;

  const section = useTeacherAttendanceSection();
  const assignmentsQuery = useMyTeachingAssignments();
  const assignments = useMemo(() => assignmentsQuery.data ?? [], [assignmentsQuery.data]);

  const [activeTab, setActiveTab] = useState<TabKey>("homework");
  const [assignmentKey, setAssignmentKey] = useState("");
  const [homeworkTitle, setHomeworkTitle] = useState("");
  const [homeworkDescription, setHomeworkDescription] = useState("");
  const [homeworkDueDate, setHomeworkDueDate] = useState("");
  const [parentSearch, setParentSearch] = useState("");
  const [noteStudentSearch, setNoteStudentSearch] = useState("");
  const [isNoteSearchOpen, setIsNoteSearchOpen] = useState(false);
  const [selectedParentIds, setSelectedParentIds] = useState<number[]>([]);
  const [parentSubject, setParentSubject] = useState("");
  const [parentMessage, setParentMessage] = useState("");
  const [studentId, setStudentId] = useState("");
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [noteSuccess, setNoteSuccess] = useState<string | null>(null);
  const [notes, setNotes] = useState<StudentNoteDto[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [homeworkToast, setHomeworkToast] = useState<"sending" | "sent" | null>(
    null,
  );
  const [parentToast, setParentToast] = useState<"sending" | "sent" | null>(
    null,
  );

  const homeworkMutation = useSendHomework();
  const parentMessageMutation = useSendParentMessage();
  const noteSearchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (assignmentKey || assignments.length === 0) return;
    const initialAssignment = findInitialAssignment(assignments, navigationState);
    if (!initialAssignment) return;
    setAssignmentKey(toAssignmentKey(initialAssignment));
  }, [assignmentKey, assignments, navigationState]);

  const selectedAssignment = useMemo(
    () => assignments.find((assignment) => toAssignmentKey(assignment) === assignmentKey),
    [assignmentKey, assignments],
  );

  const assignmentClassLabel =
    selectedAssignment?.class_name?.trim() ||
    navigationState?.class_name ||
    section.data?.class_name ||
    "Class";
  const assignmentSectionLabel = selectedAssignment?.section_name?.trim()
    ? selectedAssignment.section_name.trim()
    : navigationState?.section_name || section.data?.section_name || "";
  const assignmentSubjectLabel =
    selectedAssignment?.subject_name?.trim() ||
    navigationState?.subject_name ||
    "";

  const studentsQuery = useStudentsBySectionDetailed(selectedAssignment?.section_id);
  const homeworkHistory = useHomeworkHistory(
    selectedAssignment?.section_id,
    selectedAssignment?.subject_id,
  );
  const parentMessagesHistory = useParentMessagesHistory(
    selectedAssignment?.section_id,
  );

  const parentStudents = useMemo(
    () => ((studentsQuery.data ?? []) as ParentStudent[]),
    [studentsQuery.data],
  );

  const filteredParents = useMemo(
    () => parentStudents.filter((student) => matchesParentSearch(student, parentSearch)),
    [parentSearch, parentStudents],
  );

  const filteredNoteStudents = useMemo(() => {
    if (!noteStudentSearch.trim()) return parentStudents.slice(0, 12);
    return parentStudents.filter((student) =>
      matchesNoteStudentSearch(student, noteStudentSearch),
    );
  }, [noteStudentSearch, parentStudents]);

  const selectedStudent = parentStudents.find(
    (student) => student.id.toString() === studentId,
  );

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (
        noteSearchRef.current &&
        !noteSearchRef.current.contains(event.target as Node)
      ) {
        setIsNoteSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);

    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    setSelectedParentIds([]);
    setStudentId("");
    setNoteStudentSearch("");
    setIsNoteSearchOpen(false);
    setNotes([]);
    setNoteError(null);
    setNoteSuccess(null);
  }, [assignmentKey]);

  const fetchNotes = useCallback(async () => {
    if (!studentId || !schoolId) return;

    setIsLoadingNotes(true);

    try {
      const response = await getStudentNotes(studentId, schoolId);
      setNotes(normalizeStudentNotes(response));
    } catch (err) {
      logger.warn("[teacher][notes] fetch_failed", { trace, err });
      setNoteError("Unable to fetch notes. Please try again.");
    } finally {
      setIsLoadingNotes(false);
    }
  }, [schoolId, studentId, trace]);

  useEffect(() => {
    if (!studentId) {
      setNotes([]);
      return;
    }

    void fetchNotes();
  }, [fetchNotes, studentId]);

  const saveNote = async () => {
    setNoteError(null);
    setNoteSuccess(null);

    if (!studentId || !noteText.trim() || !schoolId) return;

    try {
      setIsSavingNote(true);
      await createStudentNote(
        studentId,
        { note_text: noteText.trim() },
        schoolId,
      );
      setNoteSuccess("Note saved successfully.");
      setNoteText("");
      await fetchNotes();
      logger.info("[teacher][notes] create_success", { trace, studentId });
    } catch (err) {
      logger.warn("[teacher][notes] create_failed", { trace, err });
      setNoteError("Unable to save note. Please try again.");
    } finally {
      setIsSavingNote(false);
    }
  };

  const homeworkItems = useMemo(
    () => ((homeworkHistory.data ?? []) as HomeworkRecordDto[]).slice().reverse(),
    [homeworkHistory.data],
  );

  const parentMessageItems = useMemo(
    () =>
      ((parentMessagesHistory.data ?? []) as ParentMessageRecordDto[])
        .slice()
        .reverse(),
    [parentMessagesHistory.data],
  );

  const canSendHomework =
    !!selectedAssignment &&
    homeworkTitle.trim().length > 0 &&
    homeworkDescription.trim().length > 0;

  const sendHomework = () => {
    if (!selectedAssignment) return;

    setHomeworkToast("sending");
    homeworkMutation.mutate(
      {
        section_id: selectedAssignment.section_id,
        subject_id: selectedAssignment.subject_id,
        title: homeworkTitle.trim(),
        description: homeworkDescription.trim(),
        due_date: homeworkDueDate ? homeworkDueDate : null,
      },
      {
        onSuccess: () => {
          homeworkHistory.refetch();
          setHomeworkToast("sent");
          setHomeworkTitle("");
          setHomeworkDescription("");
          setHomeworkDueDate("");
          window.setTimeout(() => {
            setHomeworkToast(null);
            homeworkMutation.reset();
          }, 2200);
        },
        onError: () => {
          setHomeworkToast(null);
          homeworkMutation.reset();
        },
      },
    );
  };

  const canSendParentMessage =
    !!selectedAssignment &&
    selectedParentIds.length > 0 &&
    parentMessage.trim().length > 0;

  const toggleParent = (id: number) => {
    setSelectedParentIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  };

  const selectAllParents = () => {
    setSelectedParentIds(filteredParents.map((student) => student.id));
  };

  const clearParentSelection = () => {
    setSelectedParentIds([]);
  };

  const sendParentMessage = () => {
    if (!selectedAssignment) return;

    setParentToast("sending");
    parentMessageMutation.mutate(
      {
        section_id: selectedAssignment.section_id,
        student_ids: selectedParentIds,
        message: parentMessage.trim(),
        subject: parentSubject.trim() || null,
      },
      {
        onSuccess: () => {
          parentMessagesHistory.refetch();
          setParentToast("sent");
          setParentSubject("");
          setParentMessage("");
          setSelectedParentIds([]);
          window.setTimeout(() => {
            setParentToast(null);
            parentMessageMutation.reset();
          }, 2200);
        },
        onError: () => {
          setParentToast(null);
          parentMessageMutation.reset();
        },
      },
    );
  };

  return {
    activeTab,
    setActiveTab,
    assignments,
    assignmentClassLabel,
    assignmentSectionLabel,
    assignmentSubjectLabel,
    selectedAssignment,
    sectionLoading: section.isLoading,
    sectionError: section.error,
    refetchSection: section.refetch,
    assignmentsLoading: assignmentsQuery.isLoading,
    refetchAssignments: assignmentsQuery.refetch,
    studentsLoading: studentsQuery.isLoading,
    studentsCount: parentStudents.length,
    parentStudents,
    filteredParents,
    selectedParentIds,
    parentSearch,
    setParentSearch,
    toggleParent,
    selectAllParents,
    clearParentSelection,
    parentSubject,
    setParentSubject,
    parentMessage,
    setParentMessage,
    parentToast,
    dismissParentToast: () => setParentToast(null),
    canSendParentMessage,
    sendParentMessage,
    parentMessagePending: parentMessageMutation.isPending,
    parentMessageError: parentMessageMutation.isError,
    parentMessageSuccess: parentMessageMutation.isSuccess,
    parentMessageItems,
    parentMessagesHistoryLoading: parentMessagesHistory.isLoading,
    parentMessagesHistoryError: parentMessagesHistory.error,
    homeworkTitle,
    setHomeworkTitle,
    homeworkDescription,
    setHomeworkDescription,
    homeworkDueDate,
    setHomeworkDueDate,
    homeworkToast,
    dismissHomeworkToast: () => setHomeworkToast(null),
    canSendHomework,
    sendHomework,
    homeworkPending: homeworkMutation.isPending,
    homeworkError: homeworkMutation.isError,
    homeworkItems,
    homeworkHistoryLoading: homeworkHistory.isLoading,
    homeworkHistoryError: homeworkHistory.error,
    noteStudentSearch,
    setNoteStudentSearch,
    isNoteSearchOpen,
    setIsNoteSearchOpen,
    noteSearchRef,
    filteredNoteStudents,
    studentId,
    noteText,
    setNoteText,
    selectNoteStudent: (student: ParentStudent) => {
      setStudentId(String(student.id));
      setNoteStudentSearch(
        `${student.name}${student.roll_no ? ` (#${student.roll_no})` : ""}`,
      );
      setIsNoteSearchOpen(false);
    },
    selectedStudent,
    notes,
    isLoadingNotes,
    isSavingNote,
    noteError,
    noteSuccess,
    saveNote,
  };
}
