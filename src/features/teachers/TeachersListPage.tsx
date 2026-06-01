import { useQuery } from "@tanstack/react-query";

import { getManagementStaffExportUrl, getManagementStaffSummary } from "@/api/managementPortfolio.api";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { SubstituteTeacherModal } from "./list/components/SubstituteTeacherModal";
import { TeachersListFilters } from "./list/components/TeachersListFilters";
import { TeachersListHeader } from "./list/components/TeachersListHeader";
import { TeachersListTable } from "./list/components/TeachersListTable";
import { useTeachersListPage } from "./list/hooks/useTeachersListPage";
import { InsightState } from "@/components/feedback/InsightState";
import { useAuthStore } from "@/store/auth.store";

export function TeachersListPage() {
  const page = useTeachersListPage();
  const schoolId = useAuthStore((state) => state.schoolId);
  const summaryQuery = useQuery({
    queryKey: ["management-portfolio-staff-summary", schoolId],
    queryFn: () => getManagementStaffSummary(schoolId!),
    enabled: page.isManagement && Boolean(schoolId),
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <TeachersListHeader
        isManagement={page.isManagement}
        onAddTeacher={page.onAddTeacher}
        onExport={
          page.isManagement && schoolId
            ? () => window.open(getManagementStaffExportUrl(schoolId), "_blank", "noopener,noreferrer")
            : undefined
        }
      />

      <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5">
        {page.isManagement && summaryQuery.data ? (
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Total Teachers</div>
              <div className="mt-2 text-2xl font-black text-slate-900">{summaryQuery.data.total_teachers}</div>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Status</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                Active {summaryQuery.data.active_teachers} • On leave {summaryQuery.data.on_leave_teachers}
              </div>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Inactive</div>
              <div className="mt-2 text-2xl font-black text-slate-900">{summaryQuery.data.inactive_teachers}</div>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Readiness</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {summaryQuery.data.teachers_with_primary_section} with primary class • {summaryQuery.data.principal_assigned ? "Principal assigned" : "Principal pending"}
              </div>
            </article>
          </section>
        ) : null}

        <TeachersListFilters
          search={page.search}
          statusFilter={page.statusFilter}
          subjectFilter={page.subjectFilter}
          allAssignments={page.allAssignments}
          setSearch={page.onSearchChange}
          setStatusFilter={page.setStatusFilter}
          setSubjectFilter={page.setSubjectFilter}
        />

        {page.query.isLoading ? (
          <LoadingState label="Loading teachers..." />
        ) : null}

        {page.query.error ? (
          <ErrorState title="Unable to load teachers" message="Please retry." />
        ) : null}

        {!page.query.isLoading &&
        !page.query.error &&
        page.filtered.length === 0 ? (
          <InsightState title="Add a teacher to get started" />
        ) : null}

        {!page.query.isLoading &&
        !page.query.error &&
        page.filtered.length > 0 ? (
          <TeachersListTable
            teachers={page.filtered}
            expandedAssignments={page.expandedAssignments}
            updatingTeacherId={page.updatingTeacherId}
            toggleAssignments={page.toggleAssignments}
            onOpenTeacher={page.openTeacher}
            onStatusChange={page.onStatusChange}
            onAssignSubstitute={
              page.isManagement ? page.onAssignSubstitute : undefined
            }
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
