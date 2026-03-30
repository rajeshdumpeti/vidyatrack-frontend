import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Toast } from "@/components/feedback/Toast";

import { ManagementStudentsCreateModal } from "./students/components/ManagementStudentsCreateModal";
import { ManagementStudentsFilters } from "./students/components/ManagementStudentsFilters";
import { ManagementStudentsHeader } from "./students/components/ManagementStudentsHeader";
import { ManagementStudentsImportModal } from "./students/components/ManagementStudentsImportModal";
import { ManagementStudentsImportOverlay } from "./students/components/ManagementStudentsImportOverlay";
import { ManagementStudentsTable } from "./students/components/ManagementStudentsTable";
import { useManagementStudentsPage } from "./students/hooks/useManagementStudentsPage";
import { InsightState } from "@/components/feedback/InsightState";

export function ManagementSetupStudentsPage() {
  const page = useManagementStudentsPage();

  return (
    <div className="px-4 py-4">
      <ManagementStudentsHeader
        onImport={page.onOpenImport}
        onAdd={() => page.setIsOpen(true)}
      />

      <ManagementStudentsFilters
        search={page.search}
        setSearch={page.setSearch}
        sectionId={page.sectionId}
        setSectionId={page.setSectionId}
        sectionsLoading={page.sectionsList.isLoading}
        sections={page.sectionsList.data ?? []}
        sectionLabelById={page.sectionLabelById}
      />

      <div className="mt-4">
        {page.isBootLoading ? <LoadingState /> : null}

        {!page.isBootLoading && page.hasBootError ? (
          <div className="space-y-3">
            <ErrorState
              title="Unable to load students setup"
              message="Please retry."
            />
            <button
              type="button"
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900"
              onClick={() => {
                page.studentsQuery.refetch();
                page.classesList.refetch();
                page.sectionsList.refetch();
              }}
            >
              Retry
            </button>
          </div>
        ) : null}

        {!page.isBootLoading &&
        !page.hasBootError &&
        page.studentsPagination.pagedItems.length === 0 ? (
          <InsightState title="Add a student to get started" />
        ) : null}

        {!page.isBootLoading &&
        !page.hasBootError &&
        page.studentsPagination.pagedItems.length > 0 ? (
          <ManagementStudentsTable
            students={page.studentsPagination.pagedItems}
            sections={page.sectionsList.data ?? []}
            onViewStudent={page.viewStudent}
            pagination={page.studentsPagination}
          />
        ) : null}
      </div>

      <ManagementStudentsCreateModal
        open={page.isOpen}
        onClose={page.onClose}
        onSubmit={page.handleSubmit(page.onSubmit)}
        register={page.register}
        errors={page.errors}
        isPending={page.createMutation.isPending}
        isError={page.createMutation.isError}
        selectedClassId={page.selectedClassId}
        classes={page.classesList.data ?? []}
        availableSections={page.availableSections}
        classLabelById={page.classLabelById}
      />

      <ManagementStudentsImportModal
        open={page.isImportOpen}
        onClose={page.onCloseImport}
        selectedAcademicContext={page.selectedAcademicContext}
        previewAcademicGroups={page.previewAcademicGroups}
        importFile={page.importFile}
        setImportFile={page.setImportFile}
        setPreviewData={page.setPreviewData}
        setCommitResult={page.setCommitResult}
        previewData={page.previewData}
        commitResult={page.commitResult}
        previewImportPending={page.previewImportMutation.isPending}
        previewImportError={page.previewImportMutation.isError}
        commitImportPending={page.commitImportMutation.isPending}
        downloadTemplate={page.downloadTemplate}
        handlePreviewImport={page.handlePreviewImport}
        handleCommitImport={page.handleCommitImport}
        mapImportError={page.mapImportError}
      />

      <ManagementStudentsImportOverlay
        open={page.commitImportMutation.isPending}
      />

      {page.toast ? (
        <Toast
          variant="success"
          message={page.toast}
          onClose={() => page.setToast(null)}
        />
      ) : null}
    </div>
  );
}
