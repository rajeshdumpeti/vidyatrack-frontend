import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createStudentNote, getStudentNotes } from "@/api/studentNotes.api";
import type { StudentNoteDto } from "@/types/studentNotes.types";
import { logger } from "@/utils/logger";
import { normalizeStudentNotes } from "@/features/teachers/communications/utils/teacherCommunications.utils";

import type { PrincipalStudent } from "../types/principalCommunications.types";
import { getFilteredNoteStudents } from "../helpers/principalCommunications.helpers";

type UsePrincipalCommunicationsNotesArgs = {
  trace: string;
  schoolId: number | null | undefined;
  sectionId: number | undefined;
  subjectId: number | undefined;
  parentStudents: PrincipalStudent[];
  resetKey: string;
};

export function usePrincipalCommunicationsNotes({
  trace,
  schoolId,
  sectionId,
  subjectId,
  parentStudents,
  resetKey,
}: UsePrincipalCommunicationsNotesArgs) {
  const [noteStudentSearch, setNoteStudentSearch] = useState("");
  const [isNoteSearchOpen, setIsNoteSearchOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [noteSuccess, setNoteSuccess] = useState<string | null>(null);
  const [notes, setNotes] = useState<StudentNoteDto[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const noteSearchRef = useRef<HTMLDivElement | null>(null);

  const filteredNoteStudents = useMemo(
    () => getFilteredNoteStudents(parentStudents, noteStudentSearch),
    [noteStudentSearch, parentStudents],
  );

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
    setStudentId("");
    setNoteStudentSearch("");
    setIsNoteSearchOpen(false);
    setNotes([]);
    setNoteError(null);
    setNoteSuccess(null);
  }, [resetKey]);

  const fetchNotes = useCallback(async () => {
    if (!studentId || !schoolId) return;
    setIsLoadingNotes(true);
    try {
      const response = await getStudentNotes(studentId, schoolId);
      setNotes(normalizeStudentNotes(response));
    } catch (err) {
      logger.warn("[principal][notes] fetch_failed", { trace, err });
      setNoteError("Unable to fetch notes. Please try again.");
    } finally {
      setIsLoadingNotes(false);
    }
  }, [studentId, schoolId, trace]);

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
        {
          note_text: noteText.trim(),
          section_id: sectionId ?? null,
          subject_id: subjectId ?? null,
        },
        schoolId,
      );
      setNoteSuccess("Note saved successfully.");
      setNoteText("");
      await fetchNotes();
      logger.info("[principal][notes] create_success", { trace, studentId });
    } catch (err) {
      logger.warn("[principal][notes] create_failed", { trace, err });
      setNoteError("Unable to save note. Please try again.");
    } finally {
      setIsSavingNote(false);
    }
  };

  return {
    noteStudentSearch,
    setNoteStudentSearch,
    isNoteSearchOpen,
    setIsNoteSearchOpen,
    noteSearchRef,
    filteredNoteStudents,
    studentId,
    noteText,
    setNoteText,
    selectedStudent,
    notes,
    isLoadingNotes,
    isSavingNote,
    noteError,
    noteSuccess,
    saveNote,
    selectNoteStudent: (student: PrincipalStudent) => {
      setStudentId(String(student.id));
      setNoteStudentSearch(
        `${student.name}${student.roll_no ? ` (#${student.roll_no})` : ""}`,
      );
      setIsNoteSearchOpen(false);
    },
  };
}
