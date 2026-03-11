import { LoadingState } from "@/components/feedback/LoadingState";
import { HomeworkTabPanel } from "@/features/teachers/communications/components/HomeworkTabPanel";
import { ParentMessagesTabPanel } from "@/features/teachers/communications/components/ParentMessagesTabPanel";
import { StudentNotesTabPanel } from "@/features/teachers/communications/components/StudentNotesTabPanel";
import { TeacherCommunicationsUnavailableState } from "@/features/teachers/communications/components/TeacherCommunicationsUnavailableState";

import { PrincipalCommunicationsContextCard } from "./communications/components/PrincipalCommunicationsContextCard";
import { PrincipalCommunicationsHeader } from "./communications/components/PrincipalCommunicationsHeader";
import { PrincipalCommunicationsToasts } from "./communications/components/PrincipalCommunicationsToasts";
import { usePrincipalCommunications } from "./communications/hooks/usePrincipalCommunications";

export function PrincipalCommunicationsPage() {
  const communications = usePrincipalCommunications();

  if (communications.loadingSetup) {
    return <LoadingState label="Loading communication data..." />;
  }

  if (communications.setupError) {
    return (
      <TeacherCommunicationsUnavailableState
        title="Unable to load academic setup"
        message="Please try again later."
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!communications.isSetupComplete) {
    return (
      <TeacherCommunicationsUnavailableState
        title="Academic setup incomplete"
        message="Please ensure classes, sections, and subjects are configured."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <PrincipalCommunicationsToasts
          homeworkToast={communications.homeworkToast}
          parentToast={communications.parentToast}
          dismissHomeworkToast={communications.dismissHomeworkToast}
          dismissParentToast={communications.dismissParentToast}
        />

        <PrincipalCommunicationsHeader
          activeTab={communications.activeTab}
          onTabChange={communications.setActiveTab}
        />

        <PrincipalCommunicationsContextCard
          selectedClassId={communications.selectedClassId}
          setSelectedClassId={communications.setSelectedClassId}
          selectedSectionId={communications.selectedSectionId}
          setSelectedSectionId={communications.setSelectedSectionId}
          selectedSubjectId={communications.selectedSubjectId}
          setSelectedSubjectId={communications.setSelectedSubjectId}
          classes={communications.classes}
          filteredSections={communications.filteredSections}
          subjects={communications.subjects}
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
            studentsLoading={false}
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
