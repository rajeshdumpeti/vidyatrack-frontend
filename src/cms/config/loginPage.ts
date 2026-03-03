export const LOGIN_PAGE_CMS = {
  contentType: "login-page",
  fields: {
    heroTitle: "hero_title",
    heroSubtitle: "hero_subtitle",
    leftPanelImage: "left_panel_image",
    brandIcon: "brand_icon",
    termsText: "terms_text",
  },
  filters: {
    schoolId: "school_id",
    schoolCode: "school_code",
  },
} as const;

export type LoginPageCmsContent = {
  heroTitle: string;
  heroSubtitle: string;
  leftPanelImageUrl?: string;
  brandIconUrl?: string;
  termsText?: string;
};

export const LOGIN_PAGE_DEFAULTS: LoginPageCmsContent = {
  heroTitle: "One Platform, Complete School",
  heroSubtitle: "Attendance • Grades • Parent Communication • Reports",
  termsText: "Terms & Privacy Policy",
};
