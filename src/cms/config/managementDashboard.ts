export const MANAGEMENT_DASHBOARD_CMS = {
  // Collection types in Strapi are often pluralized in REST routes.
  // We keep aliases so local setup works even if API ID differs slightly.
  contentTypes: [
    "management-dashboard-cms",
    "management-dashboard-cms-entries",
  ],
  fields: {
    dashboardTitle: "dashboard_title",
    dashboardSubtitle: "dashboard_subtitle",
    welcomeMessage: "welcome_message",
    announcementText: "announcement_text",
    heroImage: "hero_image",
    quickLink1Label: "quick_link_1_label",
    quickLink1Url: "quick_link_1_url",
    quickLink2Label: "quick_link_2_label",
    quickLink2Url: "quick_link_2_url",
    supportContactText: "support_contact_text",
  },
  filters: {
    schoolId: "school_id",
    schoolCode: "school_code",
  },
} as const;

export type ManagementDashboardCmsContent = {
  dashboardTitle: string;
  dashboardSubtitle: string;
  welcomeMessage: string;
  announcementText: string;
  heroImageUrl?: string;
  quickLink1Label: string;
  quickLink1Url: string;
  quickLink2Label: string;
  quickLink2Url: string;
  supportContactText: string;
};

export const MANAGEMENT_DASHBOARD_DEFAULTS: ManagementDashboardCmsContent = {
  dashboardTitle: "Management Dashboard",
  dashboardSubtitle:
    "Welcome to VidyaTrack. Complete the steps below to initialize your school.",
  welcomeMessage: "Pilot Status: Active",
  announcementText:
    "You are currently in the initial setup phase for the current session.",
  quickLink1Label: "Setup Academic Structure",
  quickLink1Url: "/management/setup/academic",
  quickLink2Label: "Onboard Staff",
  quickLink2Url: "/management/setup/teachers",
  supportContactText: "Need help? Contact your VidyaTrack onboarding team.",
};
