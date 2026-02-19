import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  BookOpen,
  ClipboardList,
  MessageSquare,
  StickyNote,
  Send,
  Users,
  Search,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useTeacherAttendanceSection } from "@/hooks/useTeacherAttendanceSection";
import { useMyTeachingAssignments } from "@/hooks/useMyTeachingAssignments";
import { useStudentsBySectionDetailed } from "@/hooks/useStudentsBySectionDetailed";
import { useSendHomework } from "@/hooks/useSendHomework";
import { useSendParentMessage } from "@/hooks/useSendParentMessage";
import { useHomeworkHistory } from "@/hooks/useHomeworkHistory";
import { useParentMessagesHistory } from "@/hooks/useParentMessagesHistory";
import { createStudentNote, getStudentNotes } from "@/api/studentNotes.api";
import { logger } from "@/utils/logger";
import { useAuthStore } from "@/store/auth.store";
import type {
  HomeworkRecordDto,
  ParentMessageRecordDto,
} from "@/types/communications.types";

interface StudentNote {
  id: number;
  school_id: number;
  student_id: number;
  author_user_id: number;
  author_name: string;
  author_role: string;
  note_text: string;
  created_at: string;
}

type TabKey = "homework" | "parents" | "notes";

type ParentStudent = {
  id: number;
  name: string;
  roll_no?: string | number | null;
  parent_phone?: string | null;
  parent_name?: string | null;
};

export function TeacherCommunicationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const trace = useMemo(() => logger.traceId(), []);
  const schoolId = useAuthStore((s) => s.schoolId);

  const section = useTeacherAttendanceSection();
  const assignmentsQuery = useMyTeachingAssignments();
  const assignments = assignmentsQuery.data ?? [];
  const className =
    location.state?.class_name || section.data?.class_name || "Class";

  const [activeTab, setActiveTab] = useState<TabKey>("homework");
  const [assignmentKey, setAssignmentKey] = useState("");

  const [homeworkTitle, setHomeworkTitle] = useState("");
  const [homeworkDescription, setHomeworkDescription] = useState("");
  const [homeworkDueDate, setHomeworkDueDate] = useState("");

  const [parentSearch, setParentSearch] = useState("");
  const [selectedParentIds, setSelectedParentIds] = useState<number[]>([]);
  const [parentSubject, setParentSubject] = useState("");
  const [parentMessage, setParentMessage] = useState("");

  const [studentId, setStudentId] = useState<string>("");
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [noteSuccess, setNoteSuccess] = useState<string | null>(null);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [homeworkToast, setHomeworkToast] = useState<"sending" | "sent" | null>(
    null,
  );
  const [parentToast, setParentToast] = useState<"sending" | "sent" | null>(
    null,
  );

  const homeworkMutation = useSendHomework();
  const parentMessageMutation = useSendParentMessage();

  useEffect(() => {
    if (!assignmentKey && assignments.length) {
      const first = assignments[0];
      setAssignmentKey(`${first.section_id}-${first.subject_id}`);
    }
  }, [assignmentKey, assignments]);

  const selectedAssignment = useMemo(() => {
    return assignments.find(
      (a) => `${a.section_id}-${a.subject_id}` === assignmentKey,
    );
  }, [assignments, assignmentKey]);

  const sectionId = selectedAssignment?.section_id;
  const studentsQuery = useStudentsBySectionDetailed(sectionId);
  const homeworkHistory = useHomeworkHistory(
    selectedAssignment?.section_id,
    selectedAssignment?.subject_id,
  );
  const parentMessagesHistory = useParentMessagesHistory(
    selectedAssignment?.section_id,
  );

  const parentStudents = useMemo(() => {
    return (studentsQuery.data ?? []) as ParentStudent[];
  }, [studentsQuery.data]);

  const filteredParents = useMemo(() => {
    const q = parentSearch.trim().toLowerCase();
    if (!q) return parentStudents;
    return parentStudents.filter((s) => {
      const name = String(s.name ?? "").toLowerCase();
      const roll = s.roll_no != null ? String(s.roll_no).toLowerCase() : "";
      const phone = String(s.parent_phone ?? "").toLowerCase();
      const parentName = String(s.parent_name ?? "").toLowerCase();
      return (
        name.includes(q) ||
        roll.includes(q) ||
        phone.includes(q) ||
        parentName.includes(q)
      );
    });
  }, [parentSearch, parentStudents]);

  const selectedStudent = parentStudents.find(
    (s) => s.id.toString() === studentId,
  );

  useEffect(() => {
    setSelectedParentIds([]);
    setStudentId("");
    setNotes([]);
    setNoteError(null);
    setNoteSuccess(null);
  }, [assignmentKey]);

  const fetchNotes = async () => {
    if (!studentId || !schoolId) return;
    setIsLoadingNotes(true);
    try {
      const response = await getStudentNotes(Number(studentId), schoolId);
      setNotes(
        (response || []).map((note: any) => ({
          ...note,
          author_user_id: note.author_user_id ?? 0,
        })),
      );
    } catch (err) {
      logger.warn("[teacher][notes] fetch_failed", { trace, err });
      setNoteError("Unable to fetch notes. Please try again.");
    } finally {
      setIsLoadingNotes(false);
    }
  };

  useEffect(() => {
    if (!studentId) {
      setNotes([]);
      return;
    }
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, schoolId]);

  const handleSaveNote = async () => {
    setNoteError(null);
    setNoteSuccess(null);
    if (!studentId || !noteText.trim() || !schoolId) return;

    try {
      setIsSavingNote(true);
      await createStudentNote(
        Number(studentId),
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

  const formattedDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return dateString;
    }
  };

  const formatShortDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const homeworkItems = useMemo(() => {
    const list = (homeworkHistory.data ?? []) as HomeworkRecordDto[];
    return list.slice().reverse();
  }, [homeworkHistory.data]);

  const parentMessageItems = useMemo(() => {
    const list = (parentMessagesHistory.data ?? []) as ParentMessageRecordDto[];
    return list.slice().reverse();
  }, [parentMessagesHistory.data]);

  const canSendHomework =
    !!selectedAssignment &&
    homeworkTitle.trim().length > 0 &&
    homeworkDescription.trim().length > 0;

  const handleSendHomework = () => {
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

  const hasParentSelection = selectedParentIds.length > 0;
  const canSendParentMessage =
    !!selectedAssignment &&
    hasParentSelection &&
    parentMessage.trim().length > 0;

  const toggleParent = (id: number) => {
    setSelectedParentIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const selectAllParents = () => {
    const allIds = filteredParents.map((s) => s.id);
    setSelectedParentIds(allIds);
  };

  const clearParentSelection = () => {
    setSelectedParentIds([]);
  };

  const handleSendParentMessage = () => {
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

  if (section.isLoading || assignmentsQuery.isLoading) {
    return <LoadingState label="Loading your teaching tools..." />;
  }

  if (section.error || !section.data?.section_id) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto w-full max-w-2xl">
          <ErrorState
            title="No attendance section assigned"
            message="Please contact management to assign your attendance section."
          />
          <button
            type="button"
            onClick={() => section.refetch()}
            className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!assignments.length) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto w-full max-w-2xl">
          <ErrorState
            title="No teaching assignments"
            message="You don't have any assigned classes yet."
          />
          <button
            type="button"
            onClick={() => assignmentsQuery.refetch()}
            className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        {homeworkToast ? (
          <div className="fixed inset-x-0 top-6 z-50 mx-auto w-full max-w-xl px-4">
            <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-lg">
              <div className="flex items-center justify-between gap-3 text-sm font-semibold text-gray-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    {homeworkToast === "sending" ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </div>
                  {homeworkToast === "sending"
                    ? "Sending homework to the class..."
                    : "Homework sent successfully."}
                </div>
                <button
                  type="button"
                  onClick={() => setHomeworkToast(null)}
                  className="rounded-full px-2 py-1 text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {parentToast ? (
          <div className="fixed inset-x-0 top-20 z-50 mx-auto w-full max-w-xl px-4">
            <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-lg">
              <div className="flex items-center justify-between gap-3 text-sm font-semibold text-gray-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    {parentToast === "sending" ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </div>
                  {parentToast === "sending"
                    ? "Sending message to parents..."
                    : "Message sent successfully."}
                </div>
                <button
                  type="button"
                  onClick={() => setParentToast(null)}
                  className="rounded-full px-2 py-1 text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-sm font-semibold text-blue-600"
            onClick={() => navigate("/teacher")}
          >
            ← Back
          </button>
          <div className="text-base font-bold text-gray-900 tracking-tight">
            Teacher Communications
          </div>
          <div />
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
                Academic Hub
              </div>
              <h1 className="mt-2 text-2xl font-extrabold text-gray-900">
                Keep families and students aligned
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Send homework, message parents, and log private student notes
                for your assigned classes.
              </p>
            </div>
            <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1">
              {(
                [
                  { key: "homework", label: "Homework" },
                  { key: "parents", label: "Parent Messages" },
                  { key: "notes", label: "Student Notes" },
                ] as { key: TabKey; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-900">
                Class & Subject
              </label>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <BookOpen className="h-5 w-5 text-blue-600" />
                {className}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Messages and homework are sent to the selected class & subject.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900">
                Students
              </label>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <Users className="h-5 w-5 text-blue-600" />
                <div className="text-sm font-semibold text-gray-900">
                  {(studentsQuery.data ?? []).length} enrolled
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Only students in this section are available.
              </p>
            </div>
          </div>
        </div>

        {activeTab === "homework" ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Homework Broadcast
                </h2>
                <p className="text-sm text-gray-500">
                  Send homework instructions to the entire class in one action.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-semibold text-gray-900">
                  New Homework
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Provide clear instructions for the class.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Homework Title
                    </label>
                    <input
                      type="text"
                      value={homeworkTitle}
                      onChange={(e) => setHomeworkTitle(e.target.value)}
                      className="mt-3 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="e.g., Chapter 5 worksheet"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Due Date
                    </label>
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <input
                        type="date"
                        value={homeworkDueDate}
                        onChange={(e) => setHomeworkDueDate(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Details
                    </label>
                    <textarea
                      value={homeworkDescription}
                      onChange={(e) => setHomeworkDescription(e.target.value)}
                      className="mt-3 h-32 w-full rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Provide steps, references, or submission rules."
                    />
                  </div>
                </div>

                {homeworkMutation.isError ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Unable to send homework. Please retry.
                    </div>
                  </div>
                ) : null}

                {/* {homeworkMutation.isSuccess ? (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Homework sent successfully to the class.
                    </div>
                  </div>
                ) : null} */}

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Visible to all students in this class.
                  </span>
                  <button
                    type="button"
                    onClick={handleSendHomework}
                    disabled={!canSendHomework || homeworkMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    {homeworkMutation.isPending
                      ? "Sending..."
                      : "Send Homework"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-semibold text-gray-900">
                  Homework Timeline
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Recently posted homework for this class.
                </p>

                {homeworkHistory.isLoading ? (
                  <div className="mt-6 text-sm text-gray-500">
                    Loading homework history...
                  </div>
                ) : homeworkHistory.error ? (
                  <div className="mt-6 text-sm text-red-600">
                    Unable to load homework history.
                  </div>
                ) : homeworkItems.length === 0 ? (
                  <div className="mt-6 text-sm text-gray-500">
                    No homework posted yet.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {homeworkItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-gray-200 bg-white p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {item.title}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              Due: {formatShortDate(item.due_date)}
                            </div>
                          </div>
                          <div className="text-xs font-semibold text-gray-500">
                            {formatShortDate(item.created_at)}
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "parents" ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Parent Messaging
                </h2>
                <p className="text-sm text-gray-500">
                  Send targeted updates to one or multiple parents in the class.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-semibold text-gray-900">
                  New Message
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select recipients and craft your update.
                </p>

                <div className="mt-5 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                      <Search className="h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={parentSearch}
                        onChange={(e) => setParentSearch(e.target.value)}
                        placeholder="Search student or parent..."
                        className="w-56 bg-transparent text-sm font-medium text-gray-700 outline-none placeholder:text-gray-400"
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {selectedParentIds.length} selected
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllParents}
                      className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={clearParentSelection}
                      className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="grid grid-cols-1 gap-3">
                      {filteredParents.map((student) => {
                        const isSelected = selectedParentIds.includes(
                          student.id,
                        );
                        const contact = student.parent_phone ?? "No phone";
                        return (
                          <label
                            key={student.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                              isSelected
                                ? "border-blue-500 bg-white"
                                : "border-transparent bg-white"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleParent(student.id)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-900">
                                {student.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {student.parent_name
                                  ? `${student.parent_name} • ${contact}`
                                  : contact}
                              </div>
                            </div>
                            <div className="text-xs font-semibold text-gray-400">
                              {student.roll_no ? `#${student.roll_no}` : ""}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Message Subject (optional)
                    </label>
                    <input
                      type="text"
                      value={parentSubject}
                      onChange={(e) => setParentSubject(e.target.value)}
                      className="mt-3 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="e.g., Upcoming quiz"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Message
                    </label>
                    <textarea
                      value={parentMessage}
                      onChange={(e) => setParentMessage(e.target.value)}
                      className="mt-3 h-28 w-full rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Write a short update for selected parents..."
                    />
                  </div>
                </div>

                {parentMessageMutation.isError ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Unable to send message. Please retry.
                    </div>
                  </div>
                ) : null}

                {parentMessageMutation.isSuccess ? (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Parent message delivered successfully.
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Messages are sent to selected parents only.
                  </span>
                  <button
                    type="button"
                    onClick={handleSendParentMessage}
                    disabled={
                      !canSendParentMessage || parentMessageMutation.isPending
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    {parentMessageMutation.isPending
                      ? "Sending..."
                      : "Send Message"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-semibold text-gray-900">
                  Message Timeline
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Recent messages sent to parents.
                </p>

                {parentMessagesHistory.isLoading ? (
                  <div className="mt-6 text-sm text-gray-500">
                    Loading message history...
                  </div>
                ) : parentMessagesHistory.error ? (
                  <div className="mt-6 text-sm text-red-600">
                    Unable to load message history.
                  </div>
                ) : parentMessageItems.length === 0 ? (
                  <div className="mt-6 text-sm text-gray-500">
                    No parent messages sent yet.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {parentMessageItems.map((item) => {
                      const recipients = item.student_ids?.length ?? 0;
                      const body =
                        (
                          item as {
                            message?: string;
                            body?: string;
                            text?: string;
                          }
                        ).message ??
                        (item as { body?: string }).body ??
                        (item as { text?: string }).text ??
                        "";
                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-gray-200 bg-white p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {item.subject || "Parent update"}
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                Sent to {recipients} parent
                                {recipients === 1 ? "" : "s"}
                              </div>
                            </div>
                            <div className="text-xs font-semibold text-gray-500">
                              {formatShortDate(item.created_at)}
                            </div>
                          </div>
                          <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                            {body || "—"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "notes" ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <StickyNote className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Student Notes
                </h2>
                <p className="text-sm text-gray-500">
                  Private notes for assigned teachers only.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-900">
                Select Student
              </label>
              <select
                className="mt-3 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={studentsQuery.isLoading}
              >
                <option value="">Select a student...</option>
                {parentStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.roll_no ? `(#${s.roll_no})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-semibold text-gray-900">
                  New Note
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedStudent
                    ? `Record observations for ${selectedStudent.name}`
                    : "Choose a student to begin"}
                </p>
                <textarea
                  className="mt-4 h-32 w-full rounded-xl border border-gray-200 bg-white p-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., Shows strong participation in class discussions..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  maxLength={200}
                  disabled={!studentId}
                />
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>{noteText.length}/200 characters</span>
                  <span>Only visible to assigned teachers</span>
                </div>
                {noteError ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {noteError}
                  </div>
                ) : null}
                {noteSuccess ? (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    {noteSuccess}
                  </div>
                ) : null}
                <button
                  type="button"
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-blue-800 disabled:opacity-60"
                  onClick={handleSaveNote}
                  disabled={isSavingNote || !studentId || !noteText.trim()}
                >
                  {isSavingNote ? "Saving..." : "Save Note"}
                </button>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Notes Timeline
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedStudent
                        ? `History for ${selectedStudent.name}`
                        : "Select a student to view notes"}
                    </p>
                  </div>
                  {notes.length > 0 && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {notes.length} notes
                    </span>
                  )}
                </div>

                {!studentId ? (
                  <div className="py-10 text-center text-sm text-gray-500">
                    Choose a student to view notes.
                  </div>
                ) : isLoadingNotes ? (
                  <div className="py-10 text-center text-sm text-gray-500">
                    Loading notes...
                  </div>
                ) : notes.length === 0 ? (
                  <div className="py-10 text-center text-sm text-gray-500">
                    No notes yet for this student.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-xl border border-gray-200 bg-white p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-gray-900">
                            {note.author_name || "Unknown"}
                            {note.author_role ? (
                              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                {note.author_role}
                              </span>
                            ) : null}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formattedDate(note.created_at)}
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                          {note.note_text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
