import type {
  AuthLocationState,
  OtpCodeDigits,
  SupportedCountryCode,
} from "@/types/auth.types";

export type OtpVerifyFormValues = {
  d1: string;
  d2: string;
  d3: string;
  d4: string;
};

export type OtpVerifyViewState = {
  locationState: AuthLocationState;
  phoneDigits: string;
  countryCode: SupportedCountryCode;
  deliveryChannel: "whatsapp" | "email";
  maskedPhone: string;
  hasPhone: boolean;
};

export type OtpVerifyDigits = OtpCodeDigits;
