import { Link } from "react-router-dom";
import { FiPhone } from "react-icons/fi";
import { HiShieldCheck } from "react-icons/hi";
import type {
  UseFormHandleSubmit,
  UseFormRegister,
  FieldErrors,
} from "react-hook-form";

import { formatPhone10, blockNonDigitKeys } from "@/utils/phone";
import { LoadingButton } from "@/components/ui/Button";
import { getUserFriendlyErrorMessage } from "@/components/feedback/errorMessage";

import type {
  OtpRequestCountryCode,
  OtpRequestFormValues,
} from "../types/otpRequest.types";
import { BrandMark } from "@/components/brand/BrandMark";
import { NeedHelpDropdown } from "@/components/auth/NeedHelpDropdown";

type OtpRequestCardProps = {
  cmsContent: unknown; // kept for interface compatibility — not used in new design
  countryCode: OtpRequestCountryCode;
  setCountryCode: (value: OtpRequestCountryCode) => void;
  register: UseFormRegister<OtpRequestFormValues>;
  handleSubmit: UseFormHandleSubmit<OtpRequestFormValues>;
  onSubmit: (values: OtpRequestFormValues) => void;
  errors: FieldErrors<OtpRequestFormValues>;
  error: unknown;
  isLoading: boolean;
  isSubmitting: boolean;
  onTroubleLoggingIn: () => void;
};

export function OtpRequestCard({
  countryCode,
  setCountryCode,
  register,
  handleSubmit,
  onSubmit,
  errors,
  error,
  isLoading,
  isSubmitting,
}: OtpRequestCardProps) {
  const { onChange: phoneOnChange, ...phoneRest } = register("phone", {
    required: "Mobile number is required",
    validate: (value) => {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 10) return "Enter a valid 10-digit mobile number";
      if (digits.length > 10) return "Enter a valid 10-digit mobile number";
      return true;
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gray-50 px-4 py-8">
      {/* Logo — identical to PasswordLoginPage */}
      <BrandMark />

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl bg-white px-8 py-10 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">Sign in with OTP</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your registered phone number to receive a one-time code.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-4"
          noValidate
        >
          {/* PHONE NUMBER */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
              Phone Number
            </label>
            <div
              className={[
                "mt-1 flex items-center gap-2 rounded-xl border bg-gray-50 px-3 py-3",
                errors.phone ? "border-red-400" : "border-gray-200",
                "focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100",
              ].join(" ")}
            >
              <FiPhone className="h-4 w-4 shrink-0 text-gray-400" />
              <select
                aria-label="Country code"
                value={countryCode}
                onChange={(e) =>
                  setCountryCode(e.target.value as OtpRequestCountryCode)
                }
                className="bg-transparent text-sm font-medium text-gray-700 outline-none"
              >
                <option value="+91">+91</option>
                <option value="+1">+1</option>
              </select>
              <span className="h-5 w-px bg-gray-200" />
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                autoComplete="tel"
                placeholder="98765 43210"
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                {...phoneRest}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = formatPhone10(e.target.value);
                  void phoneOnChange(e);
                }}
                onKeyDown={blockNonDigitKeys}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>

          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {getUserFriendlyErrorMessage(error)}
            </p>
          ) : null}

          <LoadingButton
            type="submit"
            isLoading={isLoading}
            disabled={isSubmitting}
            loadingText="Sending OTP..."
            fullWidth
            className="rounded-full bg-indigo-600 hover:bg-indigo-700"
          >
            Send OTP →
          </LoadingButton>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-4 text-center">
          <Link
            to="/auth/login"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Login with password instead
          </Link>
        </div>

        {/* Terms */}
        <p className="mt-4 text-xs text-gray-400 text-center">
          Login confirms acceptance of our{" "}
          <button
            type="button"
            onClick={() =>
              window.open("/legal/terms.html", "_blank", "noopener,noreferrer")
            }
            className="text-indigo-500 hover:text-indigo-600 hover:underline font-medium"
          >
            Terms &amp; Conditions
          </button>
          .
        </p>

        {/* Security notice + Need help */}
        <div className="mt-3 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 text-xs text-gray-400">
            <HiShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              This is a secure institutional system. All access attempts are
              logged and monitored for security compliance.
            </span>
          </div>
          <div className="shrink-0">
            <NeedHelpDropdown />
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
        Powered by VidyaTrack &bull; Version 4.2.0
      </p>
    </main>
  );
}
