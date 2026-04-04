import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { HiEye, HiEyeSlash, HiAcademicCap } from "react-icons/hi2";
import { HiShieldCheck, HiLockClosed } from "react-icons/hi";
import { FiUser, FiLock } from "react-icons/fi";

import { apiClient } from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import { getAuthMe } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { LoadingButton } from "@/components/ui/Button";
import { BrandMark } from "@/components/brand/BrandMark";
import { NeedHelpDropdown } from "@/components/auth/NeedHelpDropdown";

type FormValues = {
  identifier: string;
  password: string;
  remember_me: boolean;
};

type LoginErrorDetail = {
  code: string;
  message: string;
  lockout_until?: string | null;
  attempts_remaining?: number | null;
};

function computeSecondsLeft(until: string | null) {
  if (!until) return 0;
  return Math.max(0, Math.ceil((new Date(until).getTime() - Date.now()) / 1000));
}

function useCountdown(until: string | null) {
  const [secondsLeft, setSecondsLeft] = useState(() => computeSecondsLeft(until));

  useEffect(() => {
    const target = until ? new Date(until).getTime() : 0;
    const tick = () =>
      setSecondsLeft(Math.max(0, Math.ceil((target - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [until]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  return { secondsLeft, minutes, seconds };
}

export function PasswordLoginPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const setSchools = useAuthStore((s) => s.setSchools);
  const setAuthMeta = useAuthStore((s) => s.setAuthMeta);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [noPasswordSet, setNoPasswordSet] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [lockoutUntil, setLockoutUntil] = useState<string | null>(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFaToken, setTwoFaToken] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [twoFaError, setTwoFaError] = useState<string | null>(null);

  const { secondsLeft, minutes, seconds } = useCountdown(lockoutUntil);
  const isLocked = secondsLeft > 0;

  // Auto-clear lockout when countdown reaches zero
  useEffect(() => {
    if (lockoutUntil && secondsLeft === 0) {
      setLockoutUntil(null);
      setServerError(null);
      setAttemptsRemaining(null);
    }
  }, [secondsLeft, lockoutUntil]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { remember_me: false } });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setNoPasswordSet(false);
    setAttemptsRemaining(null);
    setIsLoading(true);
    try {
      const res = await apiClient.post(API_ENDPOINTS.auth.login, {
        identifier: values.identifier.trim(),
        password: values.password,
        remember_me: values.remember_me,
        login_method: "password",
        device_info: {
          device_type: "web",
          browser: navigator.userAgent.split(" ").pop() ?? "unknown",
          user_agent: navigator.userAgent,
        },
      });

      const data = res.data;

      if (data?.data?.requires_2fa) {
        setTwoFaToken(data.data.two_fa_token);
        setRequires2FA(true);
        return;
      }

      await _handleLoginSuccess(data.data);
    } catch (err: unknown) {
      const detail = (
        err as { response?: { data?: { detail?: LoginErrorDetail } } }
      )?.response?.data?.detail;

      if (typeof detail === "object" && detail?.code === "ACCOUNT_LOCKED") {
        setLockoutUntil(detail.lockout_until ?? null);
        setAttemptsRemaining(0);
        setNoPasswordSet(false);
        setServerError(null);
      } else if (typeof detail === "object" && detail?.code === "NO_PASSWORD_SET") {
        setNoPasswordSet(true);
        setLockoutUntil(null);
        setAttemptsRemaining(null);
        setServerError(null);
      } else {
        setNoPasswordSet(false);
        setLockoutUntil(null);
        setAttemptsRemaining(
          typeof detail === "object" && detail?.attempts_remaining != null
            ? detail.attempts_remaining
            : null,
        );
        setServerError(
          typeof detail === "object" && detail?.message
            ? detail.message
            : "Login failed. Please check your credentials.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const on2FASubmit = async () => {
    if (!twoFaToken || otpCode.length !== 6) return;
    setTwoFaError(null);
    setIs2FALoading(true);
    try {
      const res = await apiClient.post(API_ENDPOINTS.auth.verify2fa, {
        two_fa_token: twoFaToken,
        otp: otpCode,
      });
      await _handleLoginSuccess(res.data.data);
    } catch (err: unknown) {
      const detail = (
        err as { response?: { data?: { detail?: LoginErrorDetail } } }
      )?.response?.data?.detail;
      setTwoFaError(
        typeof detail === "object" && detail?.message
          ? detail.message
          : "Invalid OTP. Please try again.",
      );
    } finally {
      setIs2FALoading(false);
    }
  };

  const _handleLoginSuccess = async (data: {
    access_token: string;
    user: {
      role: string;
      school_id?: string | null;
      portal_redirect_url?: string;
    };
  }) => {
    setToken(data.access_token);
    const me = await getAuthMe();
    setSchools(Array.isArray(me.schools) ? me.schools : []);
    const role = (me.role ?? data.user.role)?.toLowerCase().trim();
    setAuthMeta({ role: role ?? null, schoolId: me.school_id ?? null });

    if (!role) {
      clearAuth();
      return;
    }
    if (role === "super_admin") navigate("/platform", { replace: true });
    else if (role === "management") {
      if (Array.isArray(me.schools) && me.schools.length > 1)
        navigate("/auth/select-school", { replace: true });
      else navigate("/management", { replace: true });
    } else if (role === "teacher") navigate("/teacher", { replace: true });
    else if (role === "principal") navigate("/principal", { replace: true });
    else {
      clearAuth();
    }
  };

  // 2FA screen
  if (requires2FA) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white px-8 py-10 shadow-lg text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
            <HiAcademicCap className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Two-Factor Verification
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            A 6-digit OTP has been sent to your registered phone. Enter it below
            to complete login.
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-2xl font-bold tracking-widest text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {twoFaError && (
              <p className="mt-2 text-sm text-red-600">{twoFaError}</p>
            )}
          </div>

          <LoadingButton
            type="button"
            onClick={on2FASubmit}
            isLoading={is2FALoading}
            disabled={otpCode.length !== 6}
            loadingText="Verifying..."
            fullWidth
            className="mt-4 rounded-full"
          >
            Verify & Login
          </LoadingButton>

          <button
            type="button"
            onClick={() => {
              setRequires2FA(false);
              setTwoFaToken(null);
              setOtpCode("");
            }}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gray-50 px-4 py-8">
      <BrandMark />

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl bg-white px-8 py-10 shadow-lg">

        {/* Lockout banner */}
        {isLocked ? (
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <HiLockClosed className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Account Locked
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Too many failed attempts. Your account is temporarily locked for
              security.
            </p>

            <div className="mt-5 w-full rounded-2xl bg-red-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-400">
                Try again in
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-red-600">
                {String(minutes).padStart(2, "0")}
                <span className="mx-1 text-xl text-red-400">:</span>
                {String(seconds).padStart(2, "0")}
              </p>
              <p className="mt-1 text-xs text-red-400">minutes : seconds</p>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Forgot your password?{" "}
              <Link
                to="/auth/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Reset it here
              </Link>
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500">
              Please enter your credentials to access the dashboard.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 space-y-4"
              noValidate
            >
              {/* EMAIL OR PHONE */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Email or Phone
                </label>
                <div
                  className={[
                    "mt-1 flex items-center gap-2 rounded-xl border bg-gray-50 px-3 py-3",
                    errors.identifier ? "border-red-400" : "border-gray-200",
                    "focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100",
                  ].join(" ")}
                >
                  <FiUser className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    {...register("identifier", {
                      required: "Email or phone is required",
                      validate: (v) => {
                        const t = v.trim();
                        if (t.includes("@")) return true;
                        const digits = t.replace(/\D/g, "");
                        if (digits.length === 10) return true;
                        return "Enter a valid email or 10-digit phone number";
                      },
                    })}
                    type="text"
                    autoComplete="username"
                    placeholder="name@school.com"
                    className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </div>
                {errors.identifier && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Password
                  </label>
                  <Link
                    to="/auth/forgot-password"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div
                  className={[
                    "mt-1 flex items-center gap-2 rounded-xl border bg-gray-50 px-3 py-3",
                    errors.password ? "border-red-400" : "border-gray-200",
                    "focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100",
                  ].join(" ")}
                >
                  <FiLock className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Minimum 8 characters" },
                    })}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <HiEyeSlash className="h-4 w-4" />
                    ) : (
                      <HiEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  {...register("remember_me")}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600">
                  Stay signed in for 30 days
                </span>
              </label>

              {/* No password set — guide to OTP / forgot password */}
              {noPasswordSet && (
                <div className="rounded-xl bg-blue-50 px-3 py-3">
                  <p className="text-sm font-semibold text-blue-700">
                    No password set on this account.
                  </p>
                  <p className="mt-0.5 text-xs text-blue-600">
                    Use{" "}
                    <Link
                      to="/auth/otp-login"
                      className="font-semibold underline hover:text-blue-800"
                    >
                      OTP login
                    </Link>{" "}
                    or{" "}
                    <Link
                      to="/auth/forgot-password"
                      className="font-semibold underline hover:text-blue-800"
                    >
                      reset your password
                    </Link>{" "}
                    to get started.
                  </p>
                </div>
              )}

              {/* Failed attempt warning */}
              {attemptsRemaining != null && attemptsRemaining > 0 && (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5">
                  <HiLockClosed className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="text-sm text-amber-700">
                    Incorrect password.{" "}
                    <span className="font-semibold">
                      {attemptsRemaining} attempt
                      {attemptsRemaining !== 1 ? "s" : ""} remaining
                    </span>{" "}
                    before your account is locked.
                  </p>
                </div>
              )}

              {serverError && !noPasswordSet && attemptsRemaining === null && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                  {serverError}
                </p>
              )}

              <LoadingButton
                type="submit"
                isLoading={isLoading}
                loadingText="Logging in..."
                fullWidth
                className="rounded-full bg-indigo-600 hover:bg-indigo-700"
              >
                Login to Dashboard
              </LoadingButton>
            </form>

            <div className="mt-6 border-t border-gray-100 pt-4 text-center">
              <Link
                to="/auth/otp-login"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Login with OTP instead →
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
          </>
        )}

        {/* Security notice + Need help — always visible */}
        <div className="mt-6 flex items-start justify-between gap-2">
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
