import { apiClient } from "./apiClient";

export type OtpRequestBody = { phone: string };
export type OtpVerifyBody = { phone: string; otp: string };

export type OtpVerifyResponse = {
  access_token: string;
  token_type: string;
};

export async function requestOtp(phone: string): Promise<void> {
  const body: OtpRequestBody = { phone };
  await apiClient.post("/api/v1/auth/otp/request", body);
}

export async function verifyOtp(
  phone: string,
  otp: string
): Promise<OtpVerifyResponse> {
  const body: OtpVerifyBody = { phone, otp };
  const res = await apiClient.post<OtpVerifyResponse>(
    "/api/v1/auth/otp/verify",
    body
  );
  return res.data;
}

/**
 * DEV-ONLY manual verification hook (no UI change).
 * Allows calling APIs from browser console:
 *   window.__vtAuthApi.requestOtp("+919999999999")
 *   window.__vtAuthApi.verifyOtp("+919999999999","1234")
 */
declare global {
  interface Window {
    __vtAuthApi?: {
      requestOtp: typeof requestOtp;
      verifyOtp: typeof verifyOtp;
    };
  }
}

if (import.meta.env.DEV) {
  window.__vtAuthApi = { requestOtp, verifyOtp };
}
