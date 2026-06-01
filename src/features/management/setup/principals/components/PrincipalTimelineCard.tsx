import { LoadingState } from "@/components/feedback/LoadingState";
import type { PrincipalTimelineResult } from "@/types/managementPrincipal.types";

import { formatDateTime } from "../utils/principals.utils";

function statusClass(status: string) {
  const key = (status || "").toUpperCase();
  if (key === "VERIFIED" || key === "ACTIVE") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (key === "PENDING") return "border-amber-200 bg-amber-50 text-amber-700";
  if (key === "CANCELLED" || key === "DEACTIVATED" || key === "EXPIRED") return "border-slate-200 bg-slate-100 text-slate-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function PrincipalTimelineCard({
  timeline,
  isLoading,
}: {
  timeline: PrincipalTimelineResult | undefined;
  isLoading: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Principal Activity Timeline</h2>
      </div>
      {isLoading ? (
        <div className="mt-3">
          <LoadingState label="Loading principal activity..." />
        </div>
      ) : !(timeline?.items.length) ? (
        <p className="mt-3 text-sm text-slate-600">No principal workflow activity yet.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {timeline.items.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
                <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusClass(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{formatDateTime(item.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
