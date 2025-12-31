import type {
  OtpRequestBody,
  OtpVerifyBody,
  OtpVerifyResponse,
} from "../types/auth.types";
import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export async function requestOtp(phone: string): Promise<void> {
  const body: OtpRequestBody = { phone };
  await apiClient.post(API_ENDPOINTS.auth.otpRequest, body);
}

export async function verifyOtp(
  phone: string,
  otp: string
): Promise<OtpVerifyResponse> {
  const body: OtpVerifyBody = { phone, otp };
  const res = await apiClient.post<OtpVerifyResponse>(
    API_ENDPOINTS.auth.otpVerify,
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
