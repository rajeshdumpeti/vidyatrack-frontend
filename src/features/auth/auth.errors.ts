import axios from "axios";

/**
 * Auth-domain error messages (safe for users; no backend internals).
 * Keep this in features/auth to avoid polluting global feedback rules.
 */
export function getOtpVerifyErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    // Typical invalid OTP responses
    if (status === 400 || status === 401) {
      return "Invalid OTP. Please try again.";
    }

    if (status === 429) {
      return "Too many attempts. Please wait a moment and try again.";
    }

    if (status && status >= 500) {
      return "Service is temporarily unavailable. Please try again shortly.";
    }
  }

  return "We couldn’t verify the OTP. Please try again.";
}
