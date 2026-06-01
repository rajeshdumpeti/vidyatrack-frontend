import { formatDateTime } from "../utils/principals.utils";

import type { PrincipalOnboardingSessionResult } from "@/types/managementPrincipal.types";

export function PrincipalOnboardingStatusCard({
  session,
  onOpenVerify,
  onResend,
  onCancel,
  isResending,
  isCancelling,
}: {
  session: PrincipalOnboardingSessionResult;
  onOpenVerify: () => void;
  onResend: () => void;
  onCancel: () => void;
  isResending: boolean;
  isCancelling: boolean;
}) {
  if (!session || session.status !== "PENDING") return null;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
            Pending Principal Verification
          </p>
          <h2 className="mt-2 text-lg font-bold text-slate-900">{session.name}</h2>
          <p className="mt-1 text-sm text-slate-700">
            {session.phone_masked}
            {session.email ? ` • ${session.email}` : ""}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Requested: {formatDateTime(session.created_at)} • Expires: {formatDateTime(session.expires_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            onClick={onOpenVerify}
          >
            Verify OTP
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
            onClick={onResend}
            disabled={isResending}
          >
            Resend OTP
          </button>
          <button
            type="button"
            className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-60"
            onClick={onCancel}
            disabled={isCancelling}
          >
            Cancel Request
          </button>
        </div>
      </div>
    </section>
  );
}
