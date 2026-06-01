import { Navigate } from "react-router-dom";

import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RoleGuard } from "@/hooks/useRoleGuard";
import { PlatformLayout } from "@/layouts/PlatformLayout";

import { PlatformDashboardPage } from "@/features/platform/PlatformDashboardPage";
import { PlatformSchoolsListPage } from "@/features/platform/PlatformSchoolsListPage";
import { PlatformCreateSchoolPage } from "@/features/platform/PlatformCreateSchoolPage";
import { PlatformSchoolDetailPage } from "@/features/platform/PlatformSchoolDetailPage";
import { PlatformEditSchoolPage } from "@/features/platform/PlatformEditSchoolPage";
import { PlatformSchoolConsolePlaceholderPage } from "@/features/platform/PlatformSchoolConsolePlaceholderPage";

export const superadminRoutes = {
  path: "/superadmin",
  element: (
    <RoleGuard allowed="super_admin">
      <PlatformLayout />
    </RoleGuard>
  ),
  errorElement: <AppErrorBoundary />,
  children: [
    { index: true, element: <Navigate to="overview" replace /> },
    { path: "overview", element: <ErrorBoundary><PlatformDashboardPage /></ErrorBoundary> },
    { path: "schools", element: <ErrorBoundary><PlatformSchoolsListPage /></ErrorBoundary> },
    { path: "schools/add", element: <ErrorBoundary><PlatformCreateSchoolPage /></ErrorBoundary> },
    { path: "schools/:schoolId", element: <ErrorBoundary><PlatformSchoolDetailPage /></ErrorBoundary> },
    { path: "schools/:schoolId/edit", element: <ErrorBoundary><PlatformEditSchoolPage /></ErrorBoundary> },
    { path: "schools/:schoolId/setup/academic", element: <ErrorBoundary><PlatformSchoolConsolePlaceholderPage title="Academic Setup" /></ErrorBoundary> },
    { path: "schools/:schoolId/principals", element: <ErrorBoundary><PlatformSchoolConsolePlaceholderPage title="Principals" /></ErrorBoundary> },
    { path: "schools/:schoolId/setup/teachers", element: <ErrorBoundary><PlatformSchoolConsolePlaceholderPage title="Onboard Staff" /></ErrorBoundary> },
    { path: "schools/:schoolId/students", element: <ErrorBoundary><PlatformSchoolConsolePlaceholderPage title="Students" /></ErrorBoundary> },
    { path: "schools/:schoolId/teachers", element: <ErrorBoundary><PlatformSchoolConsolePlaceholderPage title="Teachers" /></ErrorBoundary> },
    { path: "schools/:schoolId/attendance", element: <ErrorBoundary><PlatformSchoolConsolePlaceholderPage title="Attendance" /></ErrorBoundary> },
    { path: "schools/:schoolId/marks", element: <ErrorBoundary><PlatformSchoolConsolePlaceholderPage title="Exams" /></ErrorBoundary> },
    { path: "schools/:schoolId/fees", element: <ErrorBoundary><PlatformSchoolConsolePlaceholderPage title="Fees" /></ErrorBoundary> },
    { path: "schools/:schoolId/reports", element: <ErrorBoundary><PlatformSchoolConsolePlaceholderPage title="Reports" /></ErrorBoundary> },
  ],
};
