import type { HomeworkRecordDto, ParentMessageRecordDto } from "@/types/communications.types";

import {
  matchesNoteStudentSearch,
  matchesParentSearch,
} from "@/features/teachers/communications/helpers/teacherCommunications.helpers";

import type { PrincipalStudent } from "../types/principalCommunications.types";

export function getFilteredParentStudents(
  students: PrincipalStudent[],
  parentSearch: string,
) {
  return students.filter((student) => matchesParentSearch(student, parentSearch));
}

export function getFilteredNoteStudents(
  students: PrincipalStudent[],
  noteStudentSearch: string,
) {
  if (!noteStudentSearch.trim()) return students.slice(0, 12);
  return students.filter((student) =>
    matchesNoteStudentSearch(student, noteStudentSearch),
  );
}

export function getReversedHomeworkItems(items: HomeworkRecordDto[]) {
  return items.slice().reverse();
}

export function getReversedParentMessageItems(items: ParentMessageRecordDto[]) {
  return items.slice().reverse();
}
