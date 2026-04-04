import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { HiShieldCheck } from "react-icons/hi";

import { apiClient } from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import { LoadingButton } from "@/components/ui/Button";

type FormValues = { identifier: string };

type ResetFormValues = {
  new_password: string;
  confirm_password: string;
};

type Step = "request" | "verify_otp" | "reset" | "done";

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: registerRequest,
    handleSubmit: handleRequest,
    formState: { errors: requestErrors },
  } = useForm<FormValues>();

  const {
    register: registerReset,
    handleSubmit: handleReset,
    watch: watchReset,
    formState: { errors: resetErrors },
  } = useForm<ResetFormValues>();

  const onRequestSubmit = async (values: FormValues) => {
    setServerError(null);
    setIsLoading(true);
    try {
      setIdentifier(values.identifier.trim());
      await apiClient.post(API_ENDPOINTS.auth.forgotPassword, {
        identifier: values.identifier.trim(),
      });
      setStep("verify_otp");
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    if (otpCode.length !== 6) return;
    setServerError(null);
    setIsLoading(true);
    try {
      const res = await apiClient.post(API_ENDPOINTS.auth.verifyResetOtp, {
        phone: identifier,
        otp: otpCode,
        purpose: "password_reset",
      });
      setResetToken(res.data.data.reset_token);
      setStep("reset");
    } catch {
      setServerError("Invalid or expired OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (values: ResetFormValues) => {
    if (!resetToken) return;
    setServerError(null);
    setIsLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.auth.resetPassword, {
        reset_token: resetToken,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      });
      setSuccessMsg("Password updated successfully!");
      setStep("done");
    } catch (err: unknown) {
      const detail = (
        err as { response?: { data?: { detail?: { message?: string } } } }
      )?.response?.data?.detail;
      setServerError(
        detail?.message ?? "Failed to reset password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gray-50 px-4 py-8">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
          <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">
            <span className="text-gray-900">Vidya</span>
            <span className="text-indigo-500">Track</span>
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl bg-white px-8 py-10 shadow-lg">
        {/* Step 1: Request OTP */}
        {step === "request" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">
              Reset your password
            </h1>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Enter your registered email address or phone number and we'll send
              you a recovery link.
            </p>

            <form
              onSubmit={handleRequest(onRequestSubmit)}
              className="mt-6 space-y-4"
              noValidate
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Email or Phone
                </label>
                <div
                  className={[
                    "mt-1 flex items-center gap-2 rounded-xl border bg-gray-50 px-3 py-3",
                    requestErrors.identifier
                      ? "border-red-400"
                      : "border-gray-200",
                    "focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100",
                  ].join(" ")}
                >
                  <span className="text-gray-400 text-sm">@</span>
                  <input
                    {...registerRequest("identifier", {
                      required: "Email or phone is required",
                    })}
                    type="text"
                    placeholder="name@school.com"
                    autoComplete="username"
                    className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </div>
                {requestErrors.identifier && (
                  <p className="mt-1 text-xs text-red-600">
                    {requestErrors.identifier.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                  {serverError}
                </p>
              )}

              <LoadingButton
                type="submit"
                isLoading={isLoading}
                loadingText="Sending..."
                fullWidth
                className="rounded-full bg-indigo-600 hover:bg-indigo-700"
              >
                Send Recovery Link →
              </LoadingButton>
            </form>

            <div className="mt-4 text-center">
              <Link
                to="/auth/login"
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                ← Back to Login
              </Link>
            </div>
          </>
        )}

        {/* Step 2: Verify OTP */}
        {step === "verify_otp" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Enter OTP</h1>
            <p className="mt-2 text-sm text-gray-500">
              A 6-digit code was sent to{" "}
              <span className="font-semibold text-gray-700">{identifier}</span>.
              Enter it below.
            </p>

            <div className="mt-6">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-2xl font-bold tracking-widest text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {serverError && (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {serverError}
              </p>
            )}

            <LoadingButton
              type="button"
              onClick={onVerifyOtp}
              isLoading={isLoading}
              disabled={otpCode.length !== 6}
              loadingText="Verifying..."
              fullWidth
              className="mt-4 rounded-full bg-indigo-600 hover:bg-indigo-700"
            >
              Verify OTP →
            </LoadingButton>

            <button
              type="button"
              onClick={() => {
                setStep("request");
                setServerError(null);
                setOtpCode("");
              }}
              className="mt-4 block w-full text-center text-sm text-indigo-600 hover:text-indigo-700"
            >
              ← Resend or change contact
            </button>
          </>
        )}

        {/* Step 3: Reset password */}
        {step === "reset" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">
              Set new password
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Choose a strong password with at least 8 characters, including a
              letter and a number.
            </p>

            <form
              onSubmit={handleReset(onResetSubmit)}
              className="mt-6 space-y-4"
              noValidate
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  New Password
                </label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                  <input
                    {...registerReset("new_password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Minimum 8 characters" },
                      validate: (v) =>
                        (/[A-Za-z]/.test(v) && /[0-9]/.test(v)) ||
                        "Must contain a letter and a number",
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {resetErrors.new_password && (
                  <p className="mt-1 text-xs text-red-600">
                    {resetErrors.new_password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Confirm Password
                </label>
                <div className="mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                  <input
                    {...registerReset("confirm_password", {
                      required: "Please confirm your password",
                      validate: (v) =>
                        v === watchReset("new_password") ||
                        "Passwords do not match",
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </div>
                {resetErrors.confirm_password && (
                  <p className="mt-1 text-xs text-red-600">
                    {resetErrors.confirm_password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                  {serverError}
                </p>
              )}

              <LoadingButton
                type="submit"
                isLoading={isLoading}
                loadingText="Saving..."
                fullWidth
                className="rounded-full bg-indigo-600 hover:bg-indigo-700"
              >
                Save New Password
              </LoadingButton>
            </form>
          </>
        )}

        {/* Step 4: Done */}
        {step === "done" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <HiShieldCheck className="h-7 w-7 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Password Updated!
            </h1>
            <p className="mt-2 text-sm text-gray-500">{successMsg}</p>
            <Link
              to="/auth/login"
              className="mt-6 block rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 text-center"
            >
              Go to Login →
            </Link>
          </div>
        )}
      </div>

      {/* Protected badge */}
      <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-500 shadow-sm">
        <HiShieldCheck className="h-3.5 w-3.5 text-gray-400" />
        Protected by VidyaTrack Security
      </div>
    </main>
  );
}
