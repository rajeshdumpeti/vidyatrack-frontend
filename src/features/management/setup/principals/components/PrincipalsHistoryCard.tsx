import { LoadingState } from "@/components/feedback/LoadingState";
import type { PrincipalHistoryItem } from "@/types/managementPrincipal.types";

import { formatDateTime } from "../utils/principals.utils";

export function PrincipalsHistoryCard({
  history,
  isLoading,
}: {
  history: PrincipalHistoryItem[];
  isLoading: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Previous Deactivated Principals
        </h2>
      </div>
      {isLoading ? (
        <div className="mt-3">
          <LoadingState label="Loading principal history..." />
        </div>
      ) : history.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          No deactivated principals yet.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {history.map((row) => (
            <div
              key={row.id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
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
          ))}
        </div>
      )}
    </section>
  );
}
