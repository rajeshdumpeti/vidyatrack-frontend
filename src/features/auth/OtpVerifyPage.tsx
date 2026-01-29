import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { FiHelpCircle } from "react-icons/fi";
import { HiAcademicCap, HiLockClosed } from "react-icons/hi2";

import { useAuthStore } from "@/store/auth.store";
import { ErrorState } from "@/components/feedback/ErrorState";
import { getOtpVerifyErrorMessage } from "./auth.errors";
import type { AuthLocationState, OtpCodeDigits } from "@/types/auth.types";
import { buildOtpCode, digitsFromInput, maskPhoneDigits } from "./otp.utils";
import { getAuthMe } from "@/api/auth.api";

import { useOtpVerify } from "@/hooks/useOtpVerify";
import { useOtpResend } from "@/hooks/useOtpResend";
import { logger } from "@/utils/logger";

type FormValues = {
  d1: string;
  d2: string;
  d3: string;
  d4: string;
};

function toDigits(values: FormValues): OtpCodeDigits {
  return [values.d1, values.d2, values.d3, values.d4];
}

export function OtpVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as AuthLocationState;

  const trace = useMemo(() => logger.traceId(), []);

  const setToken = useAuthStore((s) => s.setToken);
  const setAuthMeta = useAuthStore((s) => s.setAuthMeta);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const phoneDigits = state.phoneDigits ?? "";
  const hasPhone = phoneDigits.trim().length > 0;

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { d1: "", d2: "", d3: "", d4: "" },
  });

  const maskedPhone = useMemo(
    () => maskPhoneDigits(state.phoneDigits),
    [state.phoneDigits],
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

  const focusIndex = (i: number) => inputs.current[i]?.focus();

  const setDigit = (key: keyof FormValues, value: string) => {
    setValue(key, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  };

  const handleDigitChange =
    (index: 0 | 1 | 2 | 3, key: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Paste support: if user pastes 2–4 digits into any input, fill forward.
      const pasted = digitsFromInput(raw, 4);
      if (pasted.length > 1) {
        const keys: (keyof FormValues)[] = ["d1", "d2", "d3", "d4"];
        keys.forEach((k, i) => setDigit(k, pasted[i] ?? ""));
        focusIndex(Math.min(pasted.length - 1, 3));
        return;
      }

      const single = digitsFromInput(raw, 1)[0] ?? "";
      setDigit(key, single);
      if (single && index < 3) focusIndex(index + 1);
    };

  const handleKeyDown =
    (index: 0 | 1 | 2 | 3, key: keyof FormValues) =>
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        const cur = getValues()[key];
        if (!cur && index > 0) focusIndex(index - 1);
      }
      if (e.key === "Escape") {
        navigate("/auth/login", { replace: true });
      }
    };

  const onSubmit = (values: FormValues) => {
    if (!hasPhone) {
      logger.warn(
        "[auth][otp-verify] missing phoneDigits in navigation state",
        { trace },
      );
      return;
    }

    const digits = toDigits(values);
    const code = buildOtpCode(digits);
    const phoneE164 = `+91${phoneDigits}`;

    logger.info("[auth][otp-verify] submit", { trace });

    verifyOtp(
      { phoneE164, otp: code },
      {
        onSuccess: async (data) => {
          try {
            setToken(data.access_token);

            let { role } = useAuthStore.getState();
            if (!role) {
              const me = await getAuthMe();
              setAuthMeta({
                role: me.role ?? null,
                schoolId: me.school_id ?? null,
              });
              role = useAuthStore.getState().role;
            }

            if (!role) {
              clearAuth();
              throw new Error("invalid_token_claims");
            }

            if (role === "teacher") navigate("/teacher", { replace: true });
            else if (role === "principal")
              navigate("/principal", { replace: true });
            else if (role === "management")
              navigate("/management", { replace: true });
            else {
              clearAuth();
              throw new Error("unknown_role");
            }
          } catch (e) {
            logger.error("[auth][otp-verify] token handling failure", {
              trace,
              e,
            });
          }
        },
        onError: (err) => {
          logger.warn("[auth][otp-verify] verify failed", { trace, err });
        },
      },
    );
  };

  const onResend = () => {
    if (!hasPhone) return;

    const phoneE164 = `+91${phoneDigits}`;
    logger.info("[auth][otp-verify] resend clicked", { trace });

    resendOtp(phoneE164, {
      onSuccess: () =>
        logger.info("[auth][otp-verify] resend success", { trace }),
      onError: (err) =>
        logger.warn("[auth][otp-verify] resend failed", { trace, err }),
    });
  };

  const onNeedHelp = () =>
    logger.info("[auth][otp-verify] need help clicked", { trace });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
            <HiAcademicCap className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-lg font-semibold text-gray-900">
            VidyaTrack
          </span>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Need Help? 📞
        </button>
      </header>

      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-lg">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <HiLockClosed className="h-7 w-7 text-blue-600" />
            </div>
          </div>

          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Verify Account
          </h1>

          <p className="mt-3 text-center text-sm text-gray-600">
            We sent a 4-digit code to
          </p>
          <p className="mt-1 text-center text-sm font-semibold text-gray-900">
            {maskedPhone}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
            <div className="flex justify-center gap-4">
              {(["d1", "d2", "d3", "d4"] as const).map((key, idx) => {
                const { ref, ...rest } = register(key);
                return (
                  <input
                    key={key}
                    ref={(el) => {
                      ref(el);
                      inputs.current[idx] = el;
                    }}
                    inputMode="numeric"
                    maxLength={4}
                    disabled={isVerifying}
                    className="h-14 w-14 rounded-xl border border-gray-200 text-center text-xl font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    {...rest}
                    onChange={handleDigitChange(idx as 0 | 1 | 2 | 3, key)}
                    onKeyDown={handleKeyDown(idx as 0 | 1 | 2 | 3, key)}
                  />
                );
              })}
            </div>

            {!hasPhone ? (
              <div className="mt-4">
                <ErrorState
                  title="Session expired"
                  message="Please go back and request a new OTP."
                />
              </div>
            ) : null}

            {verifyError ? (
              <div className="mt-4">
                <ErrorState
                  title="Verification failed"
                  message={getOtpVerifyErrorMessage(verifyError)}
                />
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || isVerifying || !hasPhone}
              className="mt-8 w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </button>

            <div className="mt-6 text-center text-sm text-gray-600">
              Didn’t receive the code?{" "}
              <button
                type="button"
                className="font-semibold text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={onResend}
                disabled={isResending || isVerifying}
              >
                {isResending ? "Resending..." : "Resend"}
              </button>
              {resendError ? (
                <div className="mt-4">
                  <ErrorState
                    title="OTP not sent"
                    message="We couldn’t resend the OTP. Please try again."
                  />
                </div>
              ) : null}
            </div>
          </form>

          <button
            type="button"
            className="mx-auto mt-10 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            onClick={onNeedHelp}
          >
            <FiHelpCircle className="h-4 w-4" />
            Need help?
          </button>
        </div>
      </main>
    </div>
  );
}
