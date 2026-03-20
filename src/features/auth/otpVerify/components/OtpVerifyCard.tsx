import { HiLockClosed } from "react-icons/hi2";
import type { UseFormHandleSubmit, UseFormRegister } from "react-hook-form";

import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingButton } from "@/components/ui/Button";
import { getUserFriendlyErrorMessage } from "@/components/feedback/errorMessage";
import { getOtpVerifyErrorMessage } from "@/features/auth/auth.errors";

import type { OtpVerifyFormValues } from "../types/otpVerify.types";

type OtpVerifyCardProps = {
  register: UseFormRegister<OtpVerifyFormValues>;
  handleSubmit: UseFormHandleSubmit<OtpVerifyFormValues>;
  onSubmit: (values: OtpVerifyFormValues) => void;
  setInputRef: (index: number, element: HTMLInputElement | null) => void;
  onDigitChange: (
    index: 0 | 1 | 2 | 3,
    key: keyof OtpVerifyFormValues,
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (
    index: 0 | 1 | 2 | 3,
    key: keyof OtpVerifyFormValues,
  ) => (event: React.KeyboardEvent<HTMLInputElement>) => void;
  isVerifying: boolean;
  isSubmitting: boolean;
  hasPhone: boolean;
  verifyError: unknown;
  resendError: unknown;
  isResending: boolean;
  onResend: () => void;
  deliveryChannel: "whatsapp" | "email";
  maskedPhone: string;
  onNeedHelp: () => void;
};

export function OtpVerifyCard({
  register,
  handleSubmit,
  onSubmit,
  setInputRef,
  onDigitChange,
  onKeyDown,
  isVerifying,
  isSubmitting,
  hasPhone,
  verifyError,
  resendError,
  isResending,
  onResend,
  deliveryChannel,
  maskedPhone,
}: OtpVerifyCardProps) {
  return (
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
          {deliveryChannel === "email"
            ? "WhatsApp delivery failed. Enter the 4-digit code sent to your email."
            : "Enter the 4-digit code sent to your WhatsApp"}
        </p>
        <p className="mt-1 text-center text-sm font-semibold text-gray-900">
          {maskedPhone}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          <div className="flex justify-center gap-4">
            {(["d1", "d2", "d3", "d4"] as const).map((key, index) => {
              const { ref, ...rest } = register(key);
              return (
                <input
                  key={key}
                  ref={(element) => {
                    ref(element);
                    setInputRef(index, element);
                  }}
                  inputMode="numeric"
                  maxLength={4}
                  disabled={isVerifying}
                  className="h-14 w-14 rounded-xl border border-gray-200 text-center text-xl font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  {...rest}
                  onChange={onDigitChange(index as 0 | 1 | 2 | 3, key)}
                  onKeyDown={onKeyDown(index as 0 | 1 | 2 | 3, key)}
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

          <LoadingButton
            type="submit"
            isLoading={isVerifying}
            disabled={isSubmitting || !hasPhone}
            loadingText="Verifying..."
            fullWidth
            className="mt-8 rounded-full"
          >
            Verify
          </LoadingButton>

          <div className="mt-6 text-center text-sm text-gray-600">
            Didn’t receive the code?{" "}
            <LoadingButton
              type="button"
              variant="secondary"
              className="ml-2 rounded-full px-3 py-1.5 align-middle text-xs"
              onClick={onResend}
              disabled={isVerifying}
              isLoading={isResending}
              loadingText="Resending..."
            >
              Resend code
            </LoadingButton>
            {resendError ? (
              <div className="mt-4">
                <ErrorState
                  title="OTP not sent"
                  message={getUserFriendlyErrorMessage(resendError)}
                />
              </div>
            ) : null}
          </div>
        </form>
      </div>
    </main>
  );
}
