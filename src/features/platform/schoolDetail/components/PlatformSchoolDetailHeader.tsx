import { Activity, ArrowRightLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export function PlatformSchoolDetailHeader({
  schoolName,
  onRefresh,
  isRefreshing,
}: {
  schoolName: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  return (
    <>
      <div className="flex justify-center">
        <Link
          to="/platform/schools"
          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-blue-700 hover:bg-blue-100"
        >
          <ArrowRightLeft className="h-4 w-4" />
          Switch Schools
        </Link>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            {schoolName} Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Super admin observability view for users, enrollment and staff
            distribution.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-green-700 hover:bg-green-100 disabled:opacity-60 transition-colors"
          title="Refresh school data"
        >
          {isRefreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Activity className="h-4 w-4" />
          )}
          {isRefreshing ? "Refreshing..." : "Live Pulse"}
        </button>
      </div>
    </>
  );
}
