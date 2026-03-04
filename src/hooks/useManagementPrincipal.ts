import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPrincipalHistory,
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
import { useAuthStore } from "@/store/auth.store";

export function useManagementPrincipal() {
  const schoolId = useAuthStore((s) => s.schoolId);
  const query = useQuery({
    queryKey: ["management-principal", schoolId],
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
      await qc.invalidateQueries({ queryKey: ["management-principal", schoolId] });
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
      await qc.invalidateQueries({ queryKey: ["management-principal", schoolId] });
      await qc.invalidateQueries({ queryKey: ["management-principal-history", schoolId] });
    },
  });
}

export function useResendPrincipalOnboardingOtp() {
  return useMutation({
    mutationFn: (payload: PrincipalOnboardingResendInput) =>
      resendPrincipalOnboardingOtp(payload),
  });
}

export function usePrincipalHistory() {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: ["management-principal-history", schoolId],
    queryFn: () => getPrincipalHistory(schoolId!),
    enabled: Boolean(schoolId),
  });
}

export function useRetryManagementPrincipalOtp() {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useMutation({
    mutationFn: () => retryManagementPrincipalOtp(schoolId!),
  });
}
