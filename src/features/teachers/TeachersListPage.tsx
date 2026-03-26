import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";

import { SubstituteTeacherModal } from "./list/components/SubstituteTeacherModal";
import { TeachersListFilters } from "./list/components/TeachersListFilters";
import { TeachersListHeader } from "./list/components/TeachersListHeader";
import { TeachersListTable } from "./list/components/TeachersListTable";
import { useTeachersListPage } from "./list/hooks/useTeachersListPage";

export function TeachersListPage() {
  const page = useTeachersListPage();

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <TeachersListHeader
        isManagement={page.isManagement}
        onAddTeacher={page.onAddTeacher}
      />

      <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5">
        <TeachersListFilters
          search={page.search}
          statusFilter={page.statusFilter}
          subjectFilter={page.subjectFilter}
          allAssignments={page.allAssignments}
          setSearch={page.onSearchChange}
          setStatusFilter={page.setStatusFilter}
          setSubjectFilter={page.setSubjectFilter}
        />

        {page.query.isLoading ? <LoadingState label="Loading teachers..." /> : null}

        {page.query.error ? (
          <ErrorState title="Unable to load teachers" message="Please retry." />
        ) : null}

        {!page.query.isLoading && !page.query.error && page.filtered.length === 0 ? (
          <EmptyState message="No teachers match the current filters." />
        ) : null}

        {!page.query.isLoading && !page.query.error && page.filtered.length > 0 ? (
          <TeachersListTable
            teachers={page.filtered}
            expandedAssignments={page.expandedAssignments}
            updatingTeacherId={page.updatingTeacherId}
            toggleAssignments={page.toggleAssignments}
            onOpenTeacher={page.openTeacher}
            onStatusChange={page.onStatusChange}
            onAssignSubstitute={page.isManagement ? page.onAssignSubstitute : undefined}
          />
        ) : null}
      </main>

      {page.substituteTarget && page.schoolId ? (
        <SubstituteTeacherModal
          teacher={page.substituteTarget}
          allTeachers={page.allTeachers}
          schoolId={page.schoolId}
          onClose={() => page.setSubstituteTarget(null)}
        />
      ) : null}
    </div>
  );
}
