import { CheckCircle2, Loader2 } from "lucide-react";

import { getOtpVerifyErrorMessage } from "@/features/auth/auth.errors";

import { formatDateTime } from "../utils/principals.utils";

type PrincipalOtpVerifyModalProps = {
  open: boolean;
  phoneMasked: string;
  expiresAt: string;
  otp: string;
  setOtp: (value: string) => void;
  onClose: () => void;
  onVerify: () => void;
  onResend: () => Promise<void>;
  isVerifying: boolean;
  verifyError: unknown;
  isResending: boolean;
};

export function PrincipalOtpVerifyModal({
  open,
  phoneMasked,
  expiresAt,
  otp,
  setOtp,
  onClose,
  onVerify,
  onResend,
  isVerifying,
  verifyError,
  isResending,
}: PrincipalOtpVerifyModalProps) {
  if (!open) return null;

  const canSubmit = otp.trim().length >= 4 && !isVerifying;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Verify Principal OTP
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Enter OTP sent to {phoneMasked}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Session expires at {formatDateTime(expiresAt)}
            </p>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-slate-500 hover:text-slate-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-900">OTP</label>
          <input
            value={otp}
            onChange={(event) =>
              setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputMode="numeric"
            type="tel"
            placeholder="Enter 4-digit OTP"
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {verifyError ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {getOtpVerifyErrorMessage(verifyError)}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onVerify}
            disabled={!canSubmit}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {isVerifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isVerifying ? "Verifying..." : "Verify & Assign"}
          </button>
          <button
            type="button"
            onClick={() => void onResend()}
            disabled={isResending}
            className="inline-flex h-10 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
