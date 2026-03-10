import type { SupportedCountryCode } from "@/types/auth.types";

export type OtpRequestFormValues = {
  phone: string;
};

export type OtpRequestCmsContentState = {
  heroTitle: string;
  heroSubtitle: string;
  termsText: string;
  brandIconUrl?: string | null;
  leftPanelImageUrl?: string | null;
};

export type OtpRequestCountryCode = SupportedCountryCode;
