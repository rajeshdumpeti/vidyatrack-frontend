import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CircleDashed, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

import {
  completeManagementSetup,
  getManagementSetupStatus,
} from "@/api/managementSetup.api";
import { useAuthStore } from "@/store/auth.store";

const STEP_LINKS: Record<string, string> = {
  school_profile: "/management/profile",
  sections: "/management/setup/sections",
  subjects: "/management/setup/subjects",
  fee_plans: "/management/setup/fee-structure",
  principal: "/management/principals",
  teachers: "/management/setup/teachers",
  students: "/management/setup/students",
};

export function ManagementSetupChecklistPage() {
  const schoolId = useAuthStore((state) => state.schoolId);
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ["management-setup-status", schoolId],
    queryFn: () => getManagementSetupStatus(schoolId!),
    enabled: Boolean(schoolId),
  });

  const completeMutation = useMutation({
    mutationFn: () => completeManagementSetup(schoolId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["management-setup-status", schoolId],
      });
    },
  });

  const status = statusQuery.data;
  const allCompleted =
    status?.steps.every((step) => step.completed) ?? false;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Management Setup
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              First login checklist
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Finish the operational basics before daily school activity starts.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Progress
            </div>
            <div className="mt-1 text-2xl font-black text-emerald-900">
              {status?.completion_pct ?? 0}%
            </div>
            <div className="text-sm text-emerald-700">
              {(status?.completed_steps ?? 0)}/{status?.total_steps ?? 7} steps done
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {(status?.steps ?? []).map((step) => (
          <article
            key={step.key}
            className={[
              "rounded-2xl border p-5 shadow-sm",
              step.completed
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {step.completed ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
                ) : (
                  <CircleDashed className="mt-0.5 h-5 w-5 text-amber-700" />
                )}
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {step.label}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {step.count != null
                      ? `${step.count} configured`
                      : step.completed
                        ? "Configured"
                        : "Pending"}
                  </p>
                </div>
              </div>
              <Link
                to={STEP_LINKS[step.key] ?? "/management"}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Open <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Mark onboarding complete
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              This only succeeds after every required step is completed in data.
            </p>
          </div>
          <button
            type="button"
            onClick={() => completeMutation.mutate()}
            disabled={!allCompleted || completeMutation.isPending}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {completeMutation.isPending ? "Saving..." : "Complete setup"}
          </button>
        </div>

        {statusQuery.isError ? (
          <p className="mt-4 text-sm text-rose-600">
            Unable to load setup status.
          </p>
        ) : null}
        {completeMutation.isError ? (
          <p className="mt-4 text-sm text-rose-600">
            Setup is still incomplete. Finish every required step and retry.
          </p>
        ) : null}
        {status?.management_setup_complete ? (
          <p className="mt-4 text-sm font-semibold text-emerald-700">
            Setup completed at {new Date(status.management_setup_completed_at ?? "").toLocaleString()}.
          </p>
        ) : null}
      </section>
    </div>
  );
}
