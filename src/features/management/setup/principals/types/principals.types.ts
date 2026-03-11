import type { SupportedCountryCode } from "@/types/auth.types";

export type PrincipalFormValues = {
  name: string;
  phone: string;
  email?: string;
};

export type PendingSession = {
  id: number;
  phoneMasked: string;
  expiresAt: string;
};

export type PrincipalsToastState = {
  message: string;
  variant: "success" | "error" | "info";
};

export type PrincipalCountryCode = SupportedCountryCode;
