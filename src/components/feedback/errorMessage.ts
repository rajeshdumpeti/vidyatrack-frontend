import axios from "axios";

/**
 * Maps technical/network/API errors to user-safe messages.
 * - No stack traces
 * - No backend internals
 * - Consistent messaging across the app
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 429)
      return "Too many attempts. Please wait a moment and try again.";
    if (status && status >= 500)
      return "Service is temporarily unavailable. Please try again shortly.";

    // Default for 4xx and unknown
    return "Something went wrong. Please try again.";
  }

  return "Something went wrong. Please try again.";
}
