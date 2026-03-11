import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { usePrincipalDashboard } from "@/hooks/usePrincipalDashboard";
import { PrincipalDashboardHeader } from "./dashboard/components/PrincipalDashboardHeader";
import { PrincipalDashboardNotices } from "./dashboard/components/PrincipalDashboardNotices";
import { PrincipalDashboardQuickActions } from "./dashboard/components/PrincipalDashboardQuickActions";
import { PrincipalDashboardStats } from "./dashboard/components/PrincipalDashboardStats";

export function PrincipalDashboardPage() {
  const dashboardQuery = usePrincipalDashboard();

  if (dashboardQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <LoadingState label="Loading principal overview..." />
      </div>
    );
  }

  if (dashboardQuery.error || !dashboardQuery.data) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <ErrorState
          title="Unable to load principal overview"
          message="Please try again."
        />
      </div>
    );
  }

  const data = dashboardQuery.data;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <PrincipalDashboardHeader />
        <PrincipalDashboardStats
          totalStudents={data.total_students}
          totalTeachers={data.total_teachers}
          attendanceTodayPct={data.attendance_today_pct}
          attendanceTodayPresent={data.attendance_today_present}
          attendanceTodayAbsent={data.attendance_today_absent}
        />
        <PrincipalDashboardQuickActions />
        <PrincipalDashboardNotices notices={data.notices} />
      </div>
    </div>
  );
}
