import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import type { StudentProfileDto } from "@/types/student.types";
import type { StudentNoteDto } from "@/types/studentNotes.types";
import {
  Calendar,
  ChevronDown,
  FileText,
  Inbox,
  MessageSquare,
  User,
} from "lucide-react";

import { formatValue, humanizeDate } from "../utils/studentProfile.utils";

type StudentProfileNotesCardProps = {
  student: StudentProfileDto;
  notesClassFilter: string;
  setNotesClassFilter: (value: string) => void;
  notesClassOptions: string[];
  filteredNotes: StudentNoteDto[];
  notesLoading: boolean;
  notesError: boolean;
};

export function StudentProfileNotesCard({
  student,
  notesClassFilter,
  setNotesClassFilter,
  notesClassOptions,
  filteredNotes,
  notesLoading,
  notesError,
}: StudentProfileNotesCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2.5">
            <FileText className="h-5 w-5 text-blue-600" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Teacher Notes</h3>
            <p className="text-xs text-gray-500">
              Observations and feedback from teachers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">
            Filter by class
          </span>
          <div className="relative">
            <select
              value={notesClassFilter}
              onChange={(event) => setNotesClassFilter(event.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
              disabled={notesClassOptions.length === 0}
            >
              <option value="all">All Classes</option>
              {notesClassOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              strokeWidth={2}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {notesLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingState label="Loading notes..." />
          </div>
        ) : notesError ? (
          <ErrorState
            title="Unable to load notes"
            message="Please try again later."
          />
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-gray-100 p-3">
              <Inbox className="h-6 w-6 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900">No notes yet</p>
            <p className="text-xs text-gray-500">
              Notes from teachers will appear here
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="group rounded-xl border border-gray-100 bg-white p-5 transition-all hover:border-gray-200 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-sm">
                    {note.author_name?.[0]?.toUpperCase() || "T"}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {formatValue(note.author_name)}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {formatValue(note.author_role)}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <User
                          className="h-3.5 w-3.5 text-gray-400"
                          strokeWidth={1.5}
                        />
                        <span className="font-medium">Student:</span>
                        <span>{formatValue(note.student_name ?? student.name)}</span>
                        {(note.class_name ||
                          note.section_name ||
                          note.subject_name) && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {note.class_name ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                {note.class_name}
                              </span>
                            ) : null}
                            {note.section_name ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                                Section - {note.section_name}
                              </span>
                            ) : null}
                            {note.subject_name ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                {note.subject_name}
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <time className="flex items-center gap-1 whitespace-nowrap text-xs text-gray-400">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {humanizeDate(note.created_at)}
                </time>
              </div>

              <div className="mt-3 flex gap-2 pl-13">
                <MessageSquare
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400"
                  strokeWidth={1.5}
                />
                <p className="text-sm leading-relaxed text-gray-700">
                  {note.note_text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
