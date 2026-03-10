import { LoadingState } from "@/components/feedback/LoadingState";

import { TEACHER_DASHBOARD_FOOTER_TEXT } from "./constants/teacherDashboard.constants";
import { TeacherDashboardActions } from "./components/TeacherDashboardActions";
import { TeacherDashboardErrorState } from "./components/TeacherDashboardErrorState";
import { TeacherDashboardHeader } from "./components/TeacherDashboardHeader";
import { TeacherDashboardSetupState } from "./components/TeacherDashboardSetupState";
import { TeacherDashboardToast } from "./components/TeacherDashboardToast";
import { TeachingScheduleCard } from "./components/TeachingScheduleCard";
import { useTeacherDashboard } from "./hooks/useTeacherDashboard";

export function TeacherDashboard() {
  const dashboard = useTeacherDashboard();

  if (dashboard.attendanceSection.isLoading || dashboard.readiness.isLoading) {
    return <LoadingState label="Loading your section..." />;
  }

  if (
    dashboard.readiness.data &&
    dashboard.readiness.data.status !== "ready"
  ) {
    return (
      <TeacherDashboardSetupState
        status={dashboard.readiness.data.status}
        recommendedNextAction={dashboard.readiness.data.recommended_next_action}
        onRetry={dashboard.refetchAll}
      />
    );
  }

  if (dashboard.attendanceSection.error || !dashboard.attendanceSection.data) {
    return (
      <TeacherDashboardErrorState
        error={dashboard.attendanceSection.error}
        onRetry={() => dashboard.attendanceSection.refetch()}
      />
    );
  }

  const activeAssignmentKey = dashboard.activeAssignment
    ? `${dashboard.activeAssignment.section_id}-${dashboard.activeAssignment.subject_name ?? ""}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {dashboard.toast ? (
        <TeacherDashboardToast
          message={dashboard.toast}
          onDismiss={dashboard.dismissToast}
        />
      ) : null}

      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <TeacherDashboardHeader teacherName={dashboard.teacherName} />

        <TeachingScheduleCard
          assignments={dashboard.assignments}
          activeAssignmentKey={activeAssignmentKey}
          isLoading={dashboard.assignmentsLoading}
          onSelect={dashboard.selectAssignment}
        />

        <TeacherDashboardActions
          activeClassName={dashboard.activeAssignment?.class_name ?? null}
          hasActiveAssignment={dashboard.activeAssignment !== null}
          onAction={dashboard.handleAction}
        />

        <footer className="mt-16 text-center text-xs font-medium text-gray-400">
          {TEACHER_DASHBOARD_FOOTER_TEXT}
        </footer>
      </main>
    </div>
  );
}
