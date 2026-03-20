import { LoadingState } from "@/components/feedback/LoadingState";

import { HomeworkTabPanel } from "./communications/components/HomeworkTabPanel";
import { ParentMessagesTabPanel } from "./communications/components/ParentMessagesTabPanel";
import { StudentNotesTabPanel } from "./communications/components/StudentNotesTabPanel";
import { TeacherCommunicationsContextCard } from "./communications/components/TeacherCommunicationsContextCard";
import { TeacherCommunicationsHeader } from "./communications/components/TeacherCommunicationsHeader";
import { TeacherCommunicationsToast } from "./communications/components/TeacherCommunicationsToast";
import { TeacherCommunicationsUnavailableState } from "./communications/components/TeacherCommunicationsUnavailableState";
import { useTeacherCommunications } from "./communications/hooks/useTeacherCommunications";

export function TeacherCommunicationsPage() {
  const communications = useTeacherCommunications();

  if (communications.sectionLoading || communications.assignmentsLoading) {
    return <LoadingState label="Loading your teaching tools..." />;
  }

  if (
    communications.sectionError ||
    !communications.selectedAssignment?.section_id
  ) {
    return (
      <TeacherCommunicationsUnavailableState
        title="No attendance section assigned"
        message="Please contact management to assign your attendance section."
        onRetry={() => {
          communications.refetchSection();
        }}
      />
    );
  }

  if (communications.assignments.length === 0) {
    return (
      <TeacherCommunicationsUnavailableState
        title="No teaching assignments"
        message="You don't have any assigned classes yet."
        onRetry={() => {
          communications.refetchAssignments();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        {communications.homeworkToast ? (
          <TeacherCommunicationsToast
            state={communications.homeworkToast}
            label={
              communications.homeworkToast === "sending"
                ? "Sending homework to the class..."
                : "Homework sent successfully."
            }
            topClassName="top-6"
            onDismiss={communications.dismissHomeworkToast}
          />
        ) : null}

        {communications.parentToast ? (
          <TeacherCommunicationsToast
            state={communications.parentToast}
            label={
              communications.parentToast === "sending"
                ? "Sending message to parents..."
                : "Message sent successfully."
            }
            topClassName="top-20"
            onDismiss={communications.dismissParentToast}
          />
        ) : null}

        <TeacherCommunicationsHeader
          activeTab={communications.activeTab}
          onTabChange={communications.setActiveTab}
        />

        <TeacherCommunicationsContextCard
          assignmentClassLabel={communications.assignmentClassLabel}
          assignmentSectionLabel={communications.assignmentSectionLabel}
          assignmentSubjectLabel={communications.assignmentSubjectLabel}
          studentsCount={communications.studentsCount}
        />

        {communications.activeTab === "homework" ? (
          <HomeworkTabPanel
            title={communications.homeworkTitle}
            setTitle={communications.setHomeworkTitle}
            description={communications.homeworkDescription}
            setDescription={communications.setHomeworkDescription}
            dueDate={communications.homeworkDueDate}
            setDueDate={communications.setHomeworkDueDate}
            canSend={communications.canSendHomework}
            onSend={communications.sendHomework}
            isPending={communications.homeworkPending}
            isError={communications.homeworkError}
            timelineItems={communications.homeworkItems}
            historyLoading={communications.homeworkHistoryLoading}
            historyError={communications.homeworkHistoryError}
          />
        ) : null}

        {communications.activeTab === "parents" ? (
          <ParentMessagesTabPanel
            parentSearch={communications.parentSearch}
            setParentSearch={communications.setParentSearch}
            selectedParentIds={communications.selectedParentIds}
            filteredParents={communications.filteredParents}
            onToggleParent={communications.toggleParent}
            onSelectAll={communications.selectAllParents}
            onClear={communications.clearParentSelection}
            subject={communications.parentSubject}
            setSubject={communications.setParentSubject}
            message={communications.parentMessage}
            setMessage={communications.setParentMessage}
            isError={communications.parentMessageError}
            isSuccess={communications.parentMessageSuccess}
            canSend={communications.canSendParentMessage}
            onSend={communications.sendParentMessage}
            isPending={communications.parentMessagePending}
            timelineItems={communications.parentMessageItems}
            historyLoading={communications.parentMessagesHistoryLoading}
            historyError={communications.parentMessagesHistoryError}
          />
        ) : null}

        {communications.activeTab === "notes" ? (
          <StudentNotesTabPanel
            noteSearchRef={communications.noteSearchRef}
            noteStudentSearch={communications.noteStudentSearch}
            setNoteStudentSearch={communications.setNoteStudentSearch}
            isNoteSearchOpen={communications.isNoteSearchOpen}
            setIsNoteSearchOpen={communications.setIsNoteSearchOpen}
            filteredNoteStudents={communications.filteredNoteStudents}
            totalStudents={communications.parentStudents.length}
            studentsLoading={communications.studentsLoading}
            onSelectStudent={communications.selectNoteStudent}
            selectedStudent={communications.selectedStudent}
            noteText={communications.noteText}
            setNoteText={communications.setNoteText}
            noteError={communications.noteError}
            noteSuccess={communications.noteSuccess}
            onSaveNote={communications.saveNote}
            isSavingNote={communications.isSavingNote}
            studentId={communications.studentId}
            notes={communications.notes}
            isLoadingNotes={communications.isLoadingNotes}
          />
        ) : null}
      </div>
    </div>
  );
}
