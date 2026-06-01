import { LoadingState } from "@/components/feedback/LoadingState";
import { HomeworkTabPanel } from "@/features/teachers/communications/components/HomeworkTabPanel";
import { ParentMessagesTabPanel } from "@/features/teachers/communications/components/ParentMessagesTabPanel";
import { StudentNotesTabPanel } from "@/features/teachers/communications/components/StudentNotesTabPanel";
import { TeacherCommunicationsUnavailableState } from "@/features/teachers/communications/components/TeacherCommunicationsUnavailableState";
import { PrincipalCommunicationsContextCard } from "@/features/principal/communications/components/PrincipalCommunicationsContextCard";
import { PrincipalCommunicationsToasts } from "@/features/principal/communications/components/PrincipalCommunicationsToasts";
import { usePrincipalCommunications } from "@/features/principal/communications/hooks/usePrincipalCommunications";
import { TEACHER_COMMUNICATION_TABS } from "@/features/teachers/communications/constants/teacherCommunications.constants";

export function ManagementCommunicationsPage() {
  const communications = usePrincipalCommunications();

  if (communications.loadingSetup) {
    return <LoadingState label="Loading communication data..." />;
  }

  if (communications.setupError) {
    return (
      <TeacherCommunicationsUnavailableState
        title="Unable to load communication setup"
        message="Please try again later."
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!communications.isSetupComplete) {
    return (
      <TeacherCommunicationsUnavailableState
        title="Academic setup incomplete"
        message="Please ensure classes, sections, and subjects are configured before sending school communications."
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

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
                School Communication Hub
              </div>
              <h1 className="mt-2 text-2xl font-extrabold text-gray-900">
                Manage parent and class communications
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Send homework, parent messages, and track student notes across the active school.
              </p>
            </div>
            <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1">
              {TEACHER_COMMUNICATION_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => communications.setActiveTab(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    communications.activeTab === tab.key
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
