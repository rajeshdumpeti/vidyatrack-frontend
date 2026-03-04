import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type {
  ManagementPrincipalDto,
  ManagementPrincipalRetryOtpResult,
  PrincipalHistoryItem,
  PrincipalOnboardingResendInput,
  PrincipalOnboardingStartInput,
  PrincipalOnboardingStartResult,
  PrincipalOnboardingVerifyInput,
  PrincipalOnboardingVerifyResult,
} from "@/types/managementPrincipal.types";

export async function getManagementPrincipal(): Promise<ManagementPrincipalDto> {
  const res = await apiClient.get<ManagementPrincipalDto>(
    API_ENDPOINTS.management.principal,
  );
  return res.data;
}
export async function getManagementPrincipalBySchool(
  schoolId: number,
): Promise<ManagementPrincipalDto> {
  const res = await apiClient.get<ManagementPrincipalDto>(
    API_ENDPOINTS.management.principal,
    { params: { school_id: schoolId } },
  );
  return res.data;
}

export async function startPrincipalOnboarding(
  payload: PrincipalOnboardingStartInput,
): Promise<PrincipalOnboardingStartResult> {
  const res = await apiClient.post<PrincipalOnboardingStartResult>(
    API_ENDPOINTS.management.principalOnboardingStart,
    payload,
  );
  return res.data;
}

export async function resendPrincipalOnboardingOtp(
  payload: PrincipalOnboardingResendInput,
): Promise<PrincipalOnboardingStartResult> {
  const res = await apiClient.post<PrincipalOnboardingStartResult>(
    API_ENDPOINTS.management.principalOnboardingResend,
    payload,
  );
  return res.data;
}

export async function verifyPrincipalOnboarding(
  payload: PrincipalOnboardingVerifyInput,
): Promise<PrincipalOnboardingVerifyResult> {
  const res = await apiClient.post<PrincipalOnboardingVerifyResult>(
    API_ENDPOINTS.management.principalOnboardingVerify,
    payload,
  );
  return res.data;
}

export async function getPrincipalHistory(
  schoolId: number,
): Promise<PrincipalHistoryItem[]> {
  const res = await apiClient.get<PrincipalHistoryItem[]>(
    API_ENDPOINTS.management.principalHistory,
    { params: { school_id: schoolId } },
  );
  return res.data;
}

export async function retryManagementPrincipalOtp(
  schoolId: number,
): Promise<ManagementPrincipalRetryOtpResult> {
  const res = await apiClient.post<ManagementPrincipalRetryOtpResult>(
    API_ENDPOINTS.management.principalRetryOtp,
    {},
    { params: { school_id: schoolId } },
  );
  return res.data;
}
