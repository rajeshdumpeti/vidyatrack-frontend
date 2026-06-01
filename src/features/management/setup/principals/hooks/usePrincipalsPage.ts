import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
  useCancelPrincipalOnboarding,
  useManagementPrincipal,
  usePrincipalOnboardingSession,
  usePrincipalHistory,
  usePrincipalTimeline,
  useRegisterManagementPrincipal,
  useResendPrincipalOnboardingOtp,
  useVerifyPrincipalOnboarding,
} from "@/hooks/useManagementPrincipal";
import { useAuthStore } from "@/store/auth.store";
import { digitsOnly } from "@/utils/phone";
import { logger } from "@/utils/logger";

import type {
  PendingSession,
  PrincipalCountryCode,
  PrincipalFormValues,
  PrincipalsToastState,
} from "../types/principals.types";

export function usePrincipalsPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [toast, setToast] = useState<PrincipalsToastState | null>(null);
  const [countryCode, setCountryCode] = useState<PrincipalCountryCode>("+91");
  const [pendingSession, setPendingSession] = useState<PendingSession | null>(null);
  const [otp, setOtp] = useState("");

  const schoolId = useAuthStore((state) => state.schoolId);
  const principalQuery = useManagementPrincipal();
  const onboardingSessionQuery = usePrincipalOnboardingSession();
  const historyQuery = usePrincipalHistory();
  const timelineQuery = usePrincipalTimeline();
  const startMutation = useRegisterManagementPrincipal();
  const verifyMutation = useVerifyPrincipalOnboarding();
  const resendMutation = useResendPrincipalOnboardingOtp();
  const cancelMutation = useCancelPrincipalOnboarding();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrincipalFormValues>({
    defaultValues: { name: "", phone: "", email: "" },
  });

  const onSubmit = async (values: PrincipalFormValues) => {
    if (!schoolId) {
      setToast({
        variant: "error",
        message: "School context missing. Please re-login and try again.",
      });
      return;
    }

    const payload = {
      school_id: schoolId,
      name: values.name.trim(),
      phone: `${countryCode}${digitsOnly(values.phone)}`,
      email: values.email?.trim() || undefined,
    };

    const response = await startMutation.mutateAsync(payload);
    setPendingSession({
      id: response.session_id,
      phoneMasked: response.phone_masked,
      expiresAt: response.expires_at,
    });
    setOtp("");
    setToast({ variant: "info", message: response.message });
    logger.info("[management][principal] onboarding_start", {
      trace,
      sessionId: response.session_id,
    });
  };

  const onVerify = async () => {
    if (!schoolId || !pendingSession) return;

    const response = await verifyMutation.mutateAsync({
      school_id: schoolId,
      session_id: pendingSession.id,
      otp: otp.trim(),
    });

    logger.info("[management][principal] onboarding_verified", {
      trace,
      sessionId: pendingSession.id,
      principalId: response.principal.principal_id,
    });

    setPendingSession(null);
    setOtp("");
    reset({ name: "", phone: "", email: "" });
    setToast({
      variant: "success",
      message:
        "Principal verified and assigned successfully. Previous principal was deactivated.",
    });
  };

  const onCloseModal = () => {
    if (onboardingSessionQuery.data?.status === "PENDING") {
      setPendingSession({
        id: onboardingSessionQuery.data.session_id,
        phoneMasked: onboardingSessionQuery.data.phone_masked,
        expiresAt: onboardingSessionQuery.data.expires_at,
      });
      return;
    }
    setPendingSession(null);
    setOtp("");
  };

  const onResend = async () => {
    if (!schoolId || !pendingSession) return;
    const response = await resendMutation.mutateAsync({
      school_id: schoolId,
      session_id: pendingSession.id,
    });
    setPendingSession((prev) =>
      prev
        ? {
            ...prev,
            expiresAt: response.expires_at,
            phoneMasked: response.phone_masked,
          }
        : prev,
    );
    setToast({ variant: "info", message: response.message });
  };

  const onOpenVerify = () => {
    if (!onboardingSessionQuery.data) return;
    setPendingSession({
      id: onboardingSessionQuery.data.session_id,
      phoneMasked: onboardingSessionQuery.data.phone_masked,
      expiresAt: onboardingSessionQuery.data.expires_at,
    });
  };

  const onCancel = async () => {
    if (!schoolId || !onboardingSessionQuery.data) return;
    const response = await cancelMutation.mutateAsync({
      school_id: schoolId,
      session_id: onboardingSessionQuery.data.session_id,
    });
    setPendingSession(null);
    setOtp("");
    setToast({ variant: "info", message: response.message });
  };

  return {
    toast,
    setToast,
    countryCode,
    setCountryCode,
    pendingSession,
    otp,
    setOtp,
    principalQuery,
    onboardingSessionQuery,
    historyQuery,
    timelineQuery,
    startMutation,
    verifyMutation,
    resendMutation,
    cancelMutation,
    register,
    handleSubmit,
    errors,
    onSubmit,
    onVerify,
    onCloseModal,
    onResend,
    onOpenVerify,
    onCancel,
    deactivated: historyQuery.data ?? [],
  };
}
