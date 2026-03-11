import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import type { ManagementPrincipalResult } from "@/types/managementPrincipal.types";

export function ManagementDashboardPrincipalStatus({
  principal,
  isLoading,
}: {
  principal: ManagementPrincipalResult | undefined;
  isLoading: boolean;
}) {
  return (
    <div className="mt-6">
      <Link
        to="/management/principals"
        className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Principal Onboarding Status
            </div>
            <p className="mt-3 text-base font-bold text-slate-900">
              {isLoading
                ? "Checking principal assignment..."
                : principal
                  ? `Assigned: ${principal.name}`
                  : "No principal assigned yet"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {principal
                ? "Tap to update principal details or resend OTP."
                : "Tap to register and assign principal for OTP login."}
            </p>
          </div>
          <span
            className={[
              "rounded-full px-2.5 py-1 text-xs font-semibold",
              principal
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700",
            ].join(" ")}
          >
            {principal ? "Configured" : "Pending"}
          </span>
        </div>
      </Link>
    </div>
  );
}
