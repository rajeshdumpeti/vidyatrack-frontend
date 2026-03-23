import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PlatformCreateSchoolPage } from "@/features/platform/PlatformCreateSchoolPage";
import { PlatformDashboardPage } from "@/features/platform/PlatformDashboardPage";
import { PlatformSchoolDetailPage } from "@/features/platform/PlatformSchoolDetailPage";
import { PlatformSchoolsListPage } from "@/features/platform/PlatformSchoolsListPage";
import { RoleGuard } from "@/hooks/useRoleGuard";
import { PlatformLayout } from "@/layouts/PlatformLayout";

export const platformRoutes = {
  path: "/platform",
  element: (
    <RoleGuard allowed="super_admin">
      <PlatformLayout />
    </RoleGuard>
  ),
  errorElement: <AppErrorBoundary />,
  children: [
    { index: true, element: <ErrorBoundary><PlatformDashboardPage /></ErrorBoundary> },
    { path: "schools", element: <ErrorBoundary><PlatformSchoolsListPage /></ErrorBoundary> },
    { path: "schools/:schoolId", element: <ErrorBoundary><PlatformSchoolDetailPage /></ErrorBoundary> },
    { path: "schools/new", element: <ErrorBoundary><PlatformCreateSchoolPage /></ErrorBoundary> },
  ],
};
