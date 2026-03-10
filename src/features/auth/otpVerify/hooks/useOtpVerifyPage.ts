import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

import { getAuthMe } from "@/api/auth.api";
import { useOtpResend } from "@/hooks/useOtpResend";
import { useOtpVerify } from "@/hooks/useOtpVerify";
import { useAuthStore } from "@/store/auth.store";
import type {
  AuthLocationState,
  SupportedCountryCode,
} from "@/types/auth.types";
import { logger } from "@/utils/logger";

import { buildOtpCode, digitsFromInput, maskPhoneDigits } from "../../otp.utils";
import { toOtpDigits } from "../helpers/otpVerify.helpers";
import type { OtpVerifyFormValues } from "../types/otpVerify.types";

export function useOtpVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as AuthLocationState;
  const trace = useMemo(() => logger.traceId(), []);

  const setToken = useAuthStore((state) => state.setToken);
  const setAuthMeta = useAuthStore((state) => state.setAuthMeta);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setSchools = useAuthStore((state) => state.setSchools);

  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const phoneDigits = locationState.phoneDigits ?? "";
  const countryCode: SupportedCountryCode = locationState.countryCode ?? "+91";
  const [deliveryChannel, setDeliveryChannel] = useState<"whatsapp" | "email">(
    locationState.deliveryChannel ?? "whatsapp",
  );
  const hasPhone = phoneDigits.trim().length > 0;

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<OtpVerifyFormValues>({
    defaultValues: { d1: "", d2: "", d3: "", d4: "" },
  });

  const maskedPhone = useMemo(
    () => maskPhoneDigits(locationState.phoneDigits, countryCode),
    [countryCode, locationState.phoneDigits],
  );

  const {
    verifyOtp,
    isLoading: isVerifying,
    error: verifyError,
  } = useOtpVerify();
  const {
    resendOtp,
    isLoading: isResending,
    error: resendError,
  } = useOtpResend();

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const focusIndex = (index: number) => inputs.current[index]?.focus();

  const setDigit = (key: keyof OtpVerifyFormValues, value: string) => {
    setValue(key, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  };

  const handleDigitChange =
    (index: 0 | 1 | 2 | 3, key: keyof OtpVerifyFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      const pasted = digitsFromInput(raw, 4);
      if (pasted.length > 1) {
        const keys: (keyof OtpVerifyFormValues)[] = ["d1", "d2", "d3", "d4"];
        keys.forEach((digitKey, digitIndex) =>
          setDigit(digitKey, pasted[digitIndex] ?? ""),
        );
        focusIndex(Math.min(pasted.length - 1, 3));
        return;
      }

      const single = digitsFromInput(raw, 1)[0] ?? "";
      setDigit(key, single);
      if (single && index < 3) focusIndex(index + 1);
    };

  const handleKeyDown =
    (index: 0 | 1 | 2 | 3, key: keyof OtpVerifyFormValues) =>
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Backspace") {
        const current = getValues()[key];
        if (!current && index > 0) focusIndex(index - 1);
      }
      if (event.key === "Escape") {
        navigate("/auth/login", { replace: true });
      }
    };

  const onSubmit = (values: OtpVerifyFormValues) => {
    if (!hasPhone) {
      logger.warn("[auth][otp-verify] missing phoneDigits in navigation state", {
        trace,
      });
      return;
    }

    const code = buildOtpCode(toOtpDigits(values));
    const phoneE164 = `${countryCode}${phoneDigits}`;

    logger.info("[auth][otp-verify] submit", { trace });

    verifyOtp(
      { phoneE164, otp: code },
      {
        onSuccess: async (data) => {
          try {
            setToken(data.access_token);

            const me = await getAuthMe();
            setSchools(Array.isArray(me.schools) ? me.schools : []);

            const role = me.role?.toLowerCase().trim();

            setAuthMeta({
              role: role ?? null,
              schoolId: me.school_id ?? null,
            });

            if (!role) {
              clearAuth();
              throw new Error("invalid_token_claims");
            }

            if (role === "super_admin") {
              navigate("/platform", { replace: true });
            } else if (role === "management") {
              if (Array.isArray(me.schools) && me.schools.length > 1) {
                navigate("/auth/select-school", { replace: true });
              } else {
                navigate("/management", { replace: true });
              }
            } else if (role === "teacher") {
              navigate("/teacher", { replace: true });
            } else if (role === "principal") {
              navigate("/principal", { replace: true });
            } else {
              clearAuth();
              throw new Error("unknown_role");
            }
          } catch (error) {
            logger.error("[auth][otp-verify] token handling failure", {
              trace,
              e: error,
            });
            clearAuth();
          }
        },
        onError: (error) => {
          logger.warn("[auth][otp-verify] verify failed", { trace, err: error });
        },
      },
    );
  };

  const onResend = () => {
    if (!hasPhone) return;

    const phoneE164 = `${countryCode}${phoneDigits}`;
    logger.info("[auth][otp-verify] resend clicked", { trace });

    resendOtp(phoneE164, {
      onSuccess: (result) => {
        setDeliveryChannel(result.delivery_channel);
        logger.info("[auth][otp-verify] resend success", {
          trace,
          deliveryChannel: result.delivery_channel,
        });
      },
      onError: (error) =>
        logger.warn("[auth][otp-verify] resend failed", { trace, err: error }),
    });
  };

  const onNeedHelp = () =>
    logger.info("[auth][otp-verify] need help clicked", { trace });

  const setInputRef = (index: number, element: HTMLInputElement | null) => {
    inputs.current[index] = element;
  };

  return {
    register,
    handleSubmit,
    isSubmitting,
    isVerifying,
    verifyError,
    isResending,
    resendError,
    deliveryChannel,
    maskedPhone,
    hasPhone,
    onSubmit,
    onResend,
    onNeedHelp,
    handleDigitChange,
    handleKeyDown,
    setInputRef,
  };
}
