import { EnterMarksCompletionStatus } from "./components/EnterMarksCompletionStatus";
import { EnterMarksConfirmationModal } from "./components/EnterMarksConfirmationModal";
import { EnterMarksFooterActions } from "./components/EnterMarksFooterActions";
import { EnterMarksHeader } from "./components/EnterMarksHeader";
import { EnterMarksSelectionPanel } from "./components/EnterMarksSelectionPanel";
import { EnterMarksStatusBanners } from "./components/EnterMarksStatusBanners";
import { EnterMarksStudentRoster } from "./components/EnterMarksStudentRoster";
import { useEnterMarksPage } from "./hooks/useEnterMarksPage";

export function EnterMarks() {
  const marksPage = useEnterMarksPage();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <EnterMarksHeader />

        <EnterMarksStatusBanners
          isContextLoading={marksPage.isContextLoading}
          hasExistingMarks={marksPage.hasExistingMarks}
          existingMarksCount={marksPage.existingMarksCount}
          hasSelectedAssignment={!!marksPage.selectedAssignment}
        />

        <form
          onSubmit={marksPage.handleSubmit((values) =>
            marksPage.handleOpenConfirmation(values),
          )}
        >
          <EnterMarksSelectionPanel
            assignmentClassLabel={marksPage.assignmentClassLabel}
            assignmentSectionLabel={marksPage.assignmentSectionLabel}
            assignmentSubjectLabel={marksPage.assignmentSubjectLabel}
            register={marksPage.register}
            errors={marksPage.errors}
            maxMarks={marksPage.maxMarks}
            lockMaxMarks={marksPage.lockMaxMarks}
            isContextLoading={marksPage.isContextLoading}
            activeExamType={marksPage.activeExamType}
            customExamChips={marksPage.customExamChips}
            showCustomExamInput={marksPage.showCustomExamInput}
            customExamDraft={marksPage.customExamDraft}
            setCustomExamDraft={marksPage.setCustomExamDraft}
            setShowCustomExamInput={marksPage.setShowCustomExamInput}
            applyExamContext={marksPage.applyExamContext}
            addCustomExamChip={marksPage.addCustomExamChip}
          />

          {marksPage.selectedAssignment ? (
            <EnterMarksStudentRoster
              selectedAssignmentSubjectName={marksPage.selectedAssignment.subject_name}
              activeExamType={marksPage.activeExamType}
              totalStudents={marksPage.totalStudents}
              hasExistingMarks={marksPage.hasExistingMarks}
              existingMarksCount={marksPage.existingMarksCount}
              searchQuery={marksPage.searchQuery}
              setSearchQuery={marksPage.setSearchQuery}
              isContextLoading={marksPage.isContextLoading}
              filteredStudents={marksPage.filteredStudents}
              showStudentRows={marksPage.showStudentRows}
              marks={marksPage.marks}
              existingMarksMap={marksPage.existingMarksMap}
              register={marksPage.register}
              setValue={marksPage.setValue}
              maxMarks={marksPage.maxMarks}
              errors={marksPage.errors}
              studentsCount={marksPage.totalStudents}
            />
          ) : null}

          <EnterMarksFooterActions
            onSaveDraft={() => {
              void marksPage.handleSubmit(marksPage.handleSaveDraft)();
            }}
            onSubmit={() => undefined}
            isDirty={marksPage.isDirty}
            isAutoSaving={marksPage.isAutoSaving}
            isSubmitting={marksPage.isSubmitting}
            isContextLoading={marksPage.isContextLoading}
            filledMarks={marksPage.filledMarks}
            hasValidExamType={marksPage.hasValidExamType}
          />
        </form>

        <EnterMarksCompletionStatus
          completionPercentage={marksPage.completionPercentage}
          hasExistingMarks={marksPage.hasExistingMarks}
          existingMarksCount={marksPage.existingMarksCount}
          filledMarks={marksPage.filledMarks}
          totalStudents={marksPage.totalStudents}
        />
      </div>

      <EnterMarksConfirmationModal
        open={marksPage.showConfirmModal}
        filledMarks={marksPage.filledMarks}
        maxMarks={marksPage.maxMarks}
        hasExistingMarks={marksPage.hasExistingMarks}
        existingMarksCount={marksPage.existingMarksCount}
        isSubmitting={marksPage.isSubmitting}
        onClose={() => marksPage.setShowConfirmModal(false)}
        onConfirm={marksPage.handleFinalSubmit}
      />
    </div>
  );
}
