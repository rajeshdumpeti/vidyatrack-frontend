import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelPrincipalOnboarding,
  getPrincipalHistory,
  getPrincipalOnboardingSession,
  getPrincipalTimeline,
  getManagementPrincipalBySchool,
  resendPrincipalOnboardingOtp,
  retryManagementPrincipalOtp,
  startPrincipalOnboarding,
  verifyPrincipalOnboarding,
} from "@/api/managementPrincipal.api";
import type {
  PrincipalOnboardingResendInput,
  PrincipalOnboardingStartInput,
  PrincipalOnboardingVerifyInput,
} from "@/types/managementPrincipal.types";
import { queryKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/store/auth.store";

export function useManagementPrincipal() {
  const schoolId = useAuthStore((s) => s.schoolId);
  const query = useQuery({
    queryKey: queryKeys.managementPrincipal(schoolId),
    queryFn: () => getManagementPrincipalBySchool(schoolId!),
    enabled: Boolean(schoolId),
    retry: 1,
  });

  return query;
}

export function useRegisterManagementPrincipal() {
  const qc = useQueryClient();
  const schoolId = useAuthStore((s) => s.schoolId);
  return useMutation({
    mutationFn: (payload: PrincipalOnboardingStartInput) =>
      startPrincipalOnboarding(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: queryKeys.managementPrincipal(schoolId),
      });
      await qc.invalidateQueries({
        queryKey: ["management-principal-onboarding-session", schoolId],
      });
    },
  });
}

export function useVerifyPrincipalOnboarding() {
  const qc = useQueryClient();
  const schoolId = useAuthStore((s) => s.schoolId);
  return useMutation({
    mutationFn: (payload: PrincipalOnboardingVerifyInput) =>
      verifyPrincipalOnboarding(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: queryKeys.managementPrincipal(schoolId),
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.managementPrincipalHistory(schoolId),
      });
      await qc.invalidateQueries({
        queryKey: ["management-principal-onboarding-session", schoolId],
      });
    },
  });
}

export function useResendPrincipalOnboardingOtp() {
  const qc = useQueryClient();
  const schoolId = useAuthStore((s) => s.schoolId);
  return useMutation({
    mutationFn: (payload: PrincipalOnboardingResendInput) =>
      resendPrincipalOnboardingOtp(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["management-principal-onboarding-session", schoolId],
      });
    },
  });
}

export function usePrincipalHistory() {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: queryKeys.managementPrincipalHistory(schoolId),
    queryFn: () => getPrincipalHistory(schoolId!),
    enabled: Boolean(schoolId),
  });
}

export function usePrincipalTimeline() {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: ["management-principal-timeline", schoolId],
    queryFn: () => getPrincipalTimeline(schoolId!),
    enabled: Boolean(schoolId),
  });
}

export function usePrincipalOnboardingSession() {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: ["management-principal-onboarding-session", schoolId],
    queryFn: () => getPrincipalOnboardingSession(schoolId!),
    enabled: Boolean(schoolId),
  });
}

export function useRetryManagementPrincipalOtp() {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useMutation({
    mutationFn: () => retryManagementPrincipalOtp(schoolId!),
  });
}

export function useCancelPrincipalOnboarding() {
  const qc = useQueryClient();
  const schoolId = useAuthStore((s) => s.schoolId);
  return useMutation({
    mutationFn: cancelPrincipalOnboarding,
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["management-principal-onboarding-session", schoolId],
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.managementPrincipal(schoolId),
      });
    },
  });
}
