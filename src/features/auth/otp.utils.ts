import type { OtpCodeDigits } from "./auth.types";

export function isSingleDigit(value: string): boolean {
  return /^[0-9]$/.test(value);
}

export function digitsFromInput(value: string, max = 4): string[] {
  return value.replace(/\D/g, "").slice(0, max).split("");
}

export function buildOtpCode(d: OtpCodeDigits): string {
  return d.join("");
}

export function isOtpComplete(d: OtpCodeDigits): boolean {
  return d.every((x) => x.length === 1);
}

/**
 * UI-only masking helper.
 * We only display the last 4 digits and mask the rest.
 * Country formatting will be refined once backend returns canonical phone format.
 */
export function maskPhoneDigits(phoneDigits?: string): string {
  const digits = (phoneDigits ?? "").replace(/\D/g, "");
  if (digits.length < 4) return "+1 (***) ***-****";
  const last4 = digits.slice(-4);
  return `+1 (***) ***-${last4}`;
}
