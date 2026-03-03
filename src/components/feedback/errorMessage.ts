import axios from "axios";

function getBackendErrorCode(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;

  const data = error.response?.data as
    | {
        code?: string;
        error?: { code?: string };
        detail?: { code?: string } | string;
      }
    | undefined;

  if (typeof data?.detail === "string") return data.detail;
  return data?.code ?? data?.error?.code ?? data?.detail?.code ?? null;
}

/**
 * Maps technical/network/API errors to user-safe messages.
 * - No stack traces
 * - No backend internals
 * - Consistent messaging across the app
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
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
    if (status === 503 && code === "email_delivery_failed") {
      return "We couldn’t deliver the OTP via email. Please try again in a moment.";
    }
    if (status === 404 && code === "email_not_found_for_phone") {
      return "No email is linked to this phone number. Contact your administrator.";
    }

    if (status === 429)
      return "Too many attempts. Please wait a moment and try again.";
    if (status && status >= 500)
      return "Service is temporarily unavailable. Please try again shortly.";

    // Default for 4xx and unknown
    return "Something went wrong. Please try again.";
  }

  return "Something went wrong. Please try again.";
}
