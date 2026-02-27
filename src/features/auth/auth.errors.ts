import axios from "axios";

function getBackendErrorCode(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;

  const data = error.response?.data as
    | { code?: string; error?: { code?: string }; detail?: { code?: string } }
    | undefined;

  return data?.code ?? data?.error?.code ?? data?.detail?.code ?? null;
}

/**
 * Auth-domain error messages (safe for users; no backend internals).
 * Keep this in features/auth to avoid polluting global feedback rules.
 */
export function getOtpVerifyErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const code = getBackendErrorCode(error);

    if (
      status === 429 &&
      (code === "otp_rate_limited" || code === "otp_too_many_requests")
    ) {
      return "Too many requests. Please wait and try again.";
    }

    if (status === 503 && code === "whatsapp_delivery_failed") {
      return "We couldn’t deliver the OTP via WhatsApp. Please try again in a moment.";
    }

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
