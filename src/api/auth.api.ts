import type {
  AuthMeResponse,
  OtpRequestBody,
  OtpVerifyBody,
  OtpVerifyResponse,
} from "@/types/auth.types";
import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import { logger } from "@/utils/logger";

export async function requestOtp(phone: string): Promise<void> {
  const body: OtpRequestBody = { phone };
  if (import.meta.env.DEV) {
    logger.info("[auth][otp-request][api] request", { phone, body });
  }
  try {
    const res = await apiClient.post(API_ENDPOINTS.auth.otpRequest, body);
    if (import.meta.env.DEV) {
      logger.info("[auth][otp-request][api] response", {
        status: res.status,
        data: res.data,
      });
    }
  } catch (err: any) {
    if (import.meta.env.DEV) {
      logger.warn("[auth][otp-request][api] error", {
        status: err?.response?.status,
        data: err?.response?.data,
      });
    }
    throw err;
  }
}

export async function verifyOtp(
  phone: string,
  otp: string
): Promise<OtpVerifyResponse> {
  const body: OtpVerifyBody = { phone, otp };
  if (import.meta.env.DEV) {
    logger.info("[auth][otp-verify][api] request", { phone, otp, body });
  }
  try {
    const res = await apiClient.post<OtpVerifyResponse>(
      API_ENDPOINTS.auth.otpVerify,
      body
    );
    if (import.meta.env.DEV) {
      logger.info("[auth][otp-verify][api] response", {
        status: res.status,
        data: res.data,
      });
    }
    return res.data;
  } catch (err: any) {
    if (import.meta.env.DEV) {
      logger.warn("[auth][otp-verify][api] error", {
        status: err?.response?.status,
        data: err?.response?.data,
      });
    }
    throw err;
  }
}

export async function getAuthMe(): Promise<AuthMeResponse> {
  const res = await apiClient.get<AuthMeResponse>(API_ENDPOINTS.auth.me);
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
