import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  School,
  PlusCircle,
  Users,
  GraduationCap,
  AlertTriangle,
  UserX,
  Clock,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { apiClient } from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/constants/queryKeys";
import { InsightState } from "@/components/feedback/InsightState";

// ── Types ─────────────────────────────────────────────────────────────────────

type PlatformSummary = {
  total_schools: number;
  pilot_schools: number;
  schools_setup_incomplete: number;
  schools_never_logged_in: number;
  total_teachers: number;
  total_students: number;
  last_updated: string;
};

type Alert = {
  school_id: string;
  school_name: string;
  alert_type: "setup_incomplete" | "never_logged_in" | "no_recent_activity";
  severity: "critical" | "warning" | "info";
  message: string;
  days_since_created: number;
  action_url: string;
};

type ActivityItem = {
  event_type: string;
  school_name: string;
  description: string;
  performed_by: string;
  performed_at: string;
};

type DashboardData = {
  platform_summary: PlatformSummary;
  alerts: Alert[];
  recent_activity: ActivityItem[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const eventColors: Record<string, string> = {
  login_success: "bg-green-100 text-green-700",
  login_failure: "bg-red-100 text-red-700",
  login_locked: "bg-red-100 text-red-700",
  password_reset_requested: "bg-amber-100 text-amber-700",
  password_reset_complete: "bg-blue-100 text-blue-700",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function PlatformDashboardPage() {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: queryKeys.superadminDashboard(),
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: DashboardData }>(
        API_ENDPOINTS.superadmin.dashboard,
      );
      return res.data.data;
    },
    staleTime: 60_000,
  });

  const summary = data?.platform_summary;
  const alerts = data?.alerts ?? [];
  const activity = data?.recent_activity ?? [];

  const setupAlerts = alerts.filter((a) => a.alert_type === "setup_incomplete");
  const neverLoggedAlerts = alerts.filter((a) => a.alert_type === "never_logged_in");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {summary
              ? `Last updated ${relativeTime(summary.last_updated)}`
              : "Loading platform data…"}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      {isError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          Failed to load dashboard data. Check your connection and try refreshing.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Active Schools */}
          <button
            onClick={() => navigate("/platform/schools")}
            className="group rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Active Schools
              </p>
              <ChevronRight className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="mt-2 text-3xl font-extrabold text-blue-900">
              {isLoading ? "—" : summary?.total_schools ?? 0}
            </p>
            <p className="mt-1 text-xs text-blue-500">Click to view directory →</p>
          </button>

          {/* Registered Teachers */}
          <button
            onClick={() => navigate("/platform/schools")}
            className="group rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-left hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Registered Teachers
              </p>
              <ChevronRight className="h-4 w-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-700" />
              <p className="text-3xl font-extrabold text-emerald-900">
                {isLoading ? "—" : summary?.total_teachers ?? 0}
              </p>
            </div>
            <p className="mt-1 text-xs text-emerald-500">Across all schools</p>
          </button>

          {/* Registered Students */}
          <button
            onClick={() => navigate("/platform/schools")}
            className="group rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-left hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Registered Students
              </p>
              <ChevronRight className="h-4 w-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-700" />
              <p className="text-3xl font-extrabold text-indigo-900">
                {isLoading ? "—" : summary?.total_students ?? 0}
              </p>
            </div>
            <p className="mt-1 text-xs text-indigo-500">Across all schools</p>
          </button>

          {/* Never Logged In */}
          <button
            disabled={!neverLoggedAlerts.length}
            onClick={() =>
              document.getElementById("never-logged-section")?.scrollIntoView({ behavior: "smooth" })
            }
            className={[
              "group rounded-2xl border p-4 text-left transition-all",
              neverLoggedAlerts.length > 0
                ? "border-amber-200 bg-amber-50 hover:border-amber-400 hover:shadow-md cursor-pointer"
                : "border-gray-100 bg-gray-50 cursor-default",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <p className={`text-xs font-semibold uppercase tracking-wider ${neverLoggedAlerts.length > 0 ? "text-amber-600" : "text-gray-400"}`}>
                Never Logged In
              </p>
              {neverLoggedAlerts.length > 0 && (
                <ChevronRight className="h-4 w-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <UserX className={`h-5 w-5 ${neverLoggedAlerts.length > 0 ? "text-amber-600" : "text-gray-300"}`} />
              <p className={`text-3xl font-extrabold ${neverLoggedAlerts.length > 0 ? "text-amber-900" : "text-gray-400"}`}>
                {isLoading ? "—" : summary?.schools_never_logged_in ?? 0}
              </p>
            </div>
            <p className={`mt-1 text-xs ${neverLoggedAlerts.length > 0 ? "text-amber-500" : "text-gray-400"}`}>
              Mgmt admins inactive
            </p>
          </button>
        </div>
      )}

      {/* ── Setup Incomplete Alert Banner ── */}
      {setupAlerts.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-800">
                {setupAlerts.length} school{setupAlerts.length !== 1 ? "s" : ""} have incomplete setup.
                Management Admin may not have logged in yet.
              </p>
              <div className="mt-3 space-y-2">
                {setupAlerts.slice(0, 5).map((a) => (
                  <button
                    key={a.school_id}
                    onClick={() => navigate(a.action_url)}
                    className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2 text-left text-sm shadow-sm hover:shadow transition-shadow"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{a.school_name}</span>
                      <span className="ml-2 text-xs text-red-500">{a.message}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${a.severity === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {a.severity}
                      </span>
                      <span className="text-xs text-gray-400">{a.days_since_created}d old</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                ))}
                {setupAlerts.length > 5 && (
                  <button
                    onClick={() => navigate("/platform/schools")}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    + {setupAlerts.length - 5} more — view all schools →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Never Logged In Section ── */}
      {neverLoggedAlerts.length > 0 && (
        <div id="never-logged-section" className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <UserX className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-800">
                {neverLoggedAlerts.length} Management Admin{neverLoggedAlerts.length !== 1 ? "s" : ""}{" "}
                have never logged in. Follow up to confirm credentials were received.
              </p>
              <div className="mt-3 space-y-2">
                {neverLoggedAlerts.map((a) => (
                  <button
                    key={a.school_id + a.alert_type}
                    onClick={() => navigate(a.action_url)}
                    className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2 text-left text-sm shadow-sm hover:shadow transition-shadow"
                  >
                    <span className="font-medium text-gray-900">{a.school_name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">Created {a.days_since_created}d ago</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Action Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate("/platform/schools")}
          className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <div className="rounded-xl bg-blue-50 p-3">
            <School className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Manage Schools</h3>
            <p className="mt-1 text-sm text-gray-500">
              View and monitor your {new Date().getFullYear()} pilot schools.
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate("/platform/schools/new")}
          className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <div className="rounded-xl bg-green-50 p-3">
            <PlusCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Onboard School</h3>
            <p className="mt-1 text-sm text-gray-500">
              Register a new institution to the VidyaTrack platform.
            </p>
          </div>
        </button>
      </div>

      {/* ── Recent Activity Feed ── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-400">
          Recent Activity
        </h2>
        {isLoading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400">
            Loading activity…
          </div>
        ) : activity.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center text-sm text-gray-400">
            No recent activity to display.
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white divide-y divide-gray-50 overflow-hidden">
            {activity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${eventColors[item.event_type] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {item.description}
                    </span>
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {item.school_name}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">
                    By {item.performed_by} &bull; {relativeTime(item.performed_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pilot Banner ── */}
      <InsightState
        title="Pilot Phase: Observation Mode"
        description="This workspace is optimized for real-time visibility. Open any school to monitor teachers, students, and staff coverage in one place."
      />
    </div>
  );
}
