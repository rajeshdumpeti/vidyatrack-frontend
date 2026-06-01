import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import { schoolParams } from "./helpers/schoolParams";
import type {
  ManagementPrincipalResult,
  ManagementPrincipalRetryOtpResult,
  PrincipalHistoryItem,
  PrincipalOnboardingCancelInput,
  PrincipalOnboardingCancelResult,
  PrincipalOnboardingResendInput,
  PrincipalOnboardingSessionResult,
  PrincipalOnboardingStartInput,
  PrincipalOnboardingStartResult,
  PrincipalOnboardingVerifyInput,
  PrincipalOnboardingVerifyResult,
  PrincipalTimelineResult,
} from "@/types/managementPrincipal.types";

export async function getManagementPrincipal(): Promise<ManagementPrincipalResult> {
  const res = await apiClient.get<ManagementPrincipalResult>(
    API_ENDPOINTS.management.principal,
  );
  return res.data;
}
export async function getManagementPrincipalBySchool(
  schoolId: number,
): Promise<ManagementPrincipalResult> {
  const res = await apiClient.get<ManagementPrincipalResult>(
    API_ENDPOINTS.management.principal,
    { params: schoolParams(schoolId) },
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

export async function getPrincipalOnboardingSession(
  schoolId: number,
): Promise<PrincipalOnboardingSessionResult> {
  const res = await apiClient.get<PrincipalOnboardingSessionResult>(
    API_ENDPOINTS.management.principalOnboardingSession,
    { params: schoolParams(schoolId) },
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

export async function cancelPrincipalOnboarding(
  payload: PrincipalOnboardingCancelInput,
): Promise<PrincipalOnboardingCancelResult> {
  const res = await apiClient.post<PrincipalOnboardingCancelResult>(
    API_ENDPOINTS.management.principalOnboardingCancel,
    payload,
  );
  return res.data;
}

export async function getPrincipalHistory(
  schoolId: number,
): Promise<PrincipalHistoryItem[]> {
  const res = await apiClient.get<PrincipalHistoryItem[]>(
    API_ENDPOINTS.management.principalHistory,
    { params: schoolParams(schoolId) },
  );
  return res.data;
}

export async function getPrincipalTimeline(
  schoolId: number,
): Promise<PrincipalTimelineResult> {
  const res = await apiClient.get<PrincipalTimelineResult>(
    API_ENDPOINTS.management.principalTimeline,
    { params: schoolParams(schoolId) },
  );
  return res.data;
}

export async function retryManagementPrincipalOtp(
  schoolId: number,
): Promise<ManagementPrincipalRetryOtpResult> {
  const res = await apiClient.post<ManagementPrincipalRetryOtpResult>(
    API_ENDPOINTS.management.principalRetryOtp,
    {},
    { params: schoolParams(schoolId) },
  );
  return res.data;
}
