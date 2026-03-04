import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { AxiosError } from "axios";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Toast } from "@/components/feedback/Toast";
import type { SupportedCountryCode } from "@/types/auth.types";
import type { PrincipalHistoryItem } from "@/types/managementPrincipal.types";
import {
  useManagementPrincipal,
  usePrincipalHistory,
  useRegisterManagementPrincipal,
  useResendPrincipalOnboardingOtp,
  useVerifyPrincipalOnboarding,
} from "@/hooks/useManagementPrincipal";
import { logger } from "@/utils/logger";
import { digitsOnly } from "@/utils/phone";
import { useAuthStore } from "@/store/auth.store";
import { getOtpVerifyErrorMessage } from "@/features/auth/auth.errors";

type PrincipalFormValues = {
  name: string;
  phone: string;
  email?: string;
};

type ApiErrorBody = {
  detail?: string;
};

type PendingSession = {
  id: number;
  phoneMasked: string;
  expiresAt: string;
};

type ToastState = {
  message: string;
  variant: "success" | "error" | "info";
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export function PrincipalsPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [countryCode, setCountryCode] = useState<SupportedCountryCode>("+91");
  const [pendingSession, setPendingSession] = useState<PendingSession | null>(null);
  const [otp, setOtp] = useState("");

  const schoolId = useAuthStore((s) => s.schoolId);
  const principalQuery = useManagementPrincipal();
  const historyQuery = usePrincipalHistory();
  const startMutation = useRegisterManagementPrincipal();
  const verifyMutation = useVerifyPrincipalOnboarding();
  const resendMutation = useResendPrincipalOnboardingOtp();

  const principalApiError =
    principalQuery.error as AxiosError<ApiErrorBody> | null;
  const principalErrorStatus = principalApiError?.response?.status;
  const principalErrorCode = principalApiError?.response?.data?.detail;
  const isPrincipalNotFound =
    principalErrorStatus === 404 &&
    principalErrorCode === "principal_not_found";

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

    const res = await startMutation.mutateAsync(payload);
    setPendingSession({
      id: res.session_id,
      phoneMasked: res.phone_masked,
      expiresAt: res.expires_at,
    });
    setOtp("");
    setToast({ variant: "info", message: res.message });
    logger.info("[management][principal] onboarding_start", {
      trace,
      sessionId: res.session_id,
    });
  };

  const onVerify = async () => {
    if (!schoolId || !pendingSession) return;

    const res = await verifyMutation.mutateAsync({
      school_id: schoolId,
      session_id: pendingSession.id,
      otp: otp.trim(),
    });

    logger.info("[management][principal] onboarding_verified", {
      trace,
      sessionId: pendingSession.id,
      principalId: res.principal.principal_id,
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

  const deactivated = historyQuery.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
            Principal Details
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Register or replace school principal using OTP verification.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700" />
              <div>
                <p className="text-sm font-bold text-amber-800">Important Note</p>
                <p className="mt-1 text-sm font-medium text-amber-700">
                  New principal assignment happens only after OTP verification. The
                  existing principal is deactivated after successful verification.
                </p>
              </div>
            </div>
          </div>

          {principalQuery.isLoading ? (
            <div className="mt-4">
              <LoadingState label="Loading current principal..." />
            </div>
          ) : principalQuery.data ? (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                Current Principal
              </p>
              <p className="mt-1 text-base font-bold text-blue-900">
                {principalQuery.data.name}
              </p>
              <p className="mt-0.5 text-sm font-medium text-blue-700">
                {principalQuery.data.phone}
                {principalQuery.data.email ? ` • ${principalQuery.data.email}` : ""}
              </p>
            </div>
          ) : null}

          {!principalQuery.data && isPrincipalNotFound ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">
                No principal assigned yet
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Proceed to register your first principal.
              </p>
            </div>
          ) : null}

          {principalQuery.error && !principalQuery.data && !isPrincipalNotFound ? (
            <div className="mt-4">
              <ErrorState
                title="Unable to load principal"
                message="Please refresh and try again."
              />
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-900">Full Name *</label>
              <div className="relative mt-2">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("name", { required: "Name is required" })}
                  placeholder="e.g. Dr. Anita Sharma"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              {errors.name ? (
                <p className="mt-1 text-xs font-semibold text-red-600">{errors.name.message}</p>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900">
                Mobile Number (for OTP Login) *
              </label>
              <div className="mt-2 flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <Phone className="mr-2 h-4 w-4 text-slate-400" />
                <select
                  aria-label="Country code"
                  value={countryCode}
                  onChange={(e) =>
                    setCountryCode(e.target.value as SupportedCountryCode)
                  }
                  className="cursor-pointer bg-transparent text-sm font-semibold text-slate-700 outline-none"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                </select>
                <span className="mx-3 h-5 w-px bg-slate-200" />
                <input
                  {...register("phone", {
                    required: "Phone is required",
                    validate: (value) => {
                      const d = digitsOnly(value);
                      if (d.length < 10) return "Enter a valid 10-digit mobile number";
                      if (d.length > 10) return "Enter a valid 10-digit mobile number";
                      return true;
                    },
                  })}
                  inputMode="numeric"
                  type="tel"
                  placeholder="98765 00000"
                  className="h-full w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              <p className="mt-1 text-xs font-medium text-slate-500">
                OTP will be sent to this principal number.
              </p>
              {errors.phone ? (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {errors.phone.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900">
                Email Address (Optional)
              </label>
              <input
                {...register("email")}
                placeholder="principal@school-domain.com"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={startMutation.isPending}
                className="inline-flex h-11 items-center gap-1 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <ShieldCheck className="h-4 w-4" />
                {startMutation.isPending ? "Sending OTP..." : "Register & Verify"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Previous Deactivated Principals
            </h2>
          </div>
          {historyQuery.isLoading ? (
            <div className="mt-3">
              <LoadingState label="Loading principal history..." />
            </div>
          ) : deactivated.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No deactivated principals yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {deactivated.map((row) => (
                <HistoryRow key={row.id} row={row} />
              ))}
            </div>
          )}
        </section>
      </div>

      {pendingSession ? (
        <OtpVerifyModal
          phoneMasked={pendingSession.phoneMasked}
          expiresAt={pendingSession.expiresAt}
          otp={otp}
          setOtp={setOtp}
          onClose={() => {
            setPendingSession(null);
            setOtp("");
          }}
          isVerifying={verifyMutation.isPending}
          verifyError={verifyMutation.error}
          isResending={resendMutation.isPending}
          onVerify={onVerify}
          onResend={async () => {
            if (!schoolId) return;
            const res = await resendMutation.mutateAsync({
              school_id: schoolId,
              session_id: pendingSession.id,
            });
            setPendingSession((prev) =>
              prev
                ? { ...prev, expiresAt: res.expires_at, phoneMasked: res.phone_masked }
                : prev,
            );
            setToast({ variant: "info", message: res.message });
          }}
        />
      ) : null}

      {toast ? (
        <Toast
          variant={toast.variant}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}

function HistoryRow({ row }: { row: PrincipalHistoryItem }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{row.name}</p>
          <p className="text-sm text-slate-600">
            {row.phone}
            {row.email ? ` • ${row.email}` : ""}
          </p>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
          Deactivated
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Assigned: {formatDateTime(row.assigned_at)} • Deactivated:{" "}
        {formatDateTime(row.deactivated_at)}
      </p>
    </div>
  );
}

type OtpVerifyModalProps = {
  phoneMasked: string;
  expiresAt: string;
  otp: string;
  setOtp: (value: string) => void;
  onClose: () => void;
  onVerify: () => void;
  onResend: () => void;
  isVerifying: boolean;
  verifyError: unknown;
  isResending: boolean;
};

function OtpVerifyModal({
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
}: OtpVerifyModalProps) {
  const canSubmit = otp.trim().length >= 4 && !isVerifying;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Verify Principal OTP</h3>
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
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
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
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {isVerifying ? "Verifying..." : "Verify & Assign"}
          </button>
          <button
            type="button"
            onClick={onResend}
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
