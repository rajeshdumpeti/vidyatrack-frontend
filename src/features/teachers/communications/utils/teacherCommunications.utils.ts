import { format } from "date-fns";

import type { ParentMessageRecordDto } from "@/types/communications.types";
import type { StudentNoteDto } from "@/types/studentNotes.types";

export function formatCommunicationsDate(dateString: string) {
  try {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return dateString;
  }
}

export function formatCommunicationsShortDate(dateString?: string | null) {
  if (!dateString) return "—";

  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
}

export function normalizeStudentNotes(notes: StudentNoteDto[]) {
  return notes.map((note) => ({
    ...note,
    author_user_id: note.author_user_id ?? 0,
  }));
}

export function getParentMessageBody(item: ParentMessageRecordDto) {
  return (
    (
      item as {
        message?: string;
        body?: string;
        text?: string;
      }
    ).message ??
    (item as { body?: string }).body ??
    (item as { text?: string }).text ??
    ""
  );
}
