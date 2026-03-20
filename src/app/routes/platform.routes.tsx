import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
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
    { index: true, element: <PlatformDashboardPage /> },
    { path: "schools", element: <PlatformSchoolsListPage /> },
    { path: "schools/:schoolId", element: <PlatformSchoolDetailPage /> },
    { path: "schools/new", element: <PlatformCreateSchoolPage /> },
  ],
};
