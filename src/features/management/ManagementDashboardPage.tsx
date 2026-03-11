import { ManagementDashboardHeader } from "./dashboard/components/ManagementDashboardHeader";
import { ManagementDashboardPrincipalStatus } from "./dashboard/components/ManagementDashboardPrincipalStatus";
import { ManagementDashboardQuickLinks } from "./dashboard/components/ManagementDashboardQuickLinks";
import { useManagementDashboardPage } from "./dashboard/hooks/useManagementDashboardPage";

export function ManagementDashboardPage() {
  const page = useManagementDashboardPage();

  return (
    <div className="mx-auto max-w-5xl">
      <ManagementDashboardHeader
        schools={page.schools}
        activeSchool={page.activeSchool}
        title={page.cmsContent.dashboardTitle}
        subtitle={page.cmsContent.dashboardSubtitle}
        onSwitchSchools={page.onSwitchSchools}
      />

      <ManagementDashboardQuickLinks
        heroImageUrl={page.cmsContent.heroImageUrl}
        steps={page.steps}
        welcomeMessage={page.cmsContent.welcomeMessage}
        announcementText={page.cmsContent.announcementText}
        supportContactText={page.cmsContent.supportContactText}
      />

      <ManagementDashboardPrincipalStatus
        principal={page.principalQuery.data}
        isLoading={page.principalQuery.isLoading}
      />
    </div>
  );
}
