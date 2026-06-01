import { ArrowRight, GraduationCap, Phone, Users } from "lucide-react";
import { Link } from "react-router-dom";

import type { SuperAdminSchool } from "../hooks/usePlatformSchoolsListPage";

// ── Avatar colour by initial ───────────────────────────────────────────────────
const AVATAR_COLOURS = [
  "bg-blue-600", "bg-indigo-600", "bg-violet-600", "bg-pink-600",
  "bg-rose-600", "bg-orange-500", "bg-amber-500", "bg-green-600",
  "bg-teal-600", "bg-cyan-600",
];
function avatarColour(name: string) {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLOURS[code % AVATAR_COLOURS.length];
}

// ── Status badge ───────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pilot: "bg-blue-100 text-blue-700",
  inactive: "bg-gray-100 text-gray-500",
  suspended: "bg-red-100 text-red-600",
};
const STATUS_DOT: Record<string, string> = {
  active: "bg-green-500",
  pilot: "bg-blue-500",
  inactive: "bg-gray-400",
  suspended: "bg-red-500",
};

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[s] ?? "bg-gray-100 text-gray-500"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[s] ?? "bg-gray-400"}`} />
      {s}
    </span>
  );
}

// ── Setup progress bar ────────────────────────────────────────────────────────
function SetupBar({ pct }: { pct: number }) {
  const colour = pct === 100 ? "bg-green-500" : pct >= 75 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${colour}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-gray-400">Setup {pct}%</span>
    </div>
  );
}

// ── Row ────────────────────────────────────────────────────────────────────────
function SchoolRow({ school }: { school: SuperAdminSchool }) {
  const initials = school.initials;
  const mgmt = school.management_admin;

  return (
    <Link
      to={`/superadmin/schools/${school.id}`}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
    >
      {/* Avatar */}
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-white text-base transition-opacity group-hover:opacity-90 ${avatarColour(school.name)}`}>
        {initials}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-gray-900 truncate">{school.name}</h3>
          <StatusBadge status={school.status} />
          {school.is_test && (
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-yellow-700">
              TEST
            </span>
          )}
        </div>

        {/* Counts */}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-500">
            <Users className="h-3 w-3" />
            {school.stats.total_teachers} Teachers
          </span>
          <span className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-500">
            <GraduationCap className="h-3 w-3" />
            {school.stats.total_students} Students
          </span>
          <SetupBar pct={school.setup_completion_pct} />
        </div>

        {/* Management contact + last active */}
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          {mgmt.full_name ? (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {mgmt.full_name}
            </span>
          ) : (
            <span className="italic">No management admin</span>
          )}
          {mgmt.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {mgmt.phone}
            </span>
          )}
          <span className={mgmt.last_login_relative === "Never logged in" ? "font-medium text-amber-500" : ""}>
            Last active: {mgmt.last_login_relative}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-[10px] font-mono text-gray-300">{school.vt_school_id}</span>
        <ArrowRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-blue-500" />
      </div>
    </Link>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
        <GraduationCap className="h-7 w-7 text-gray-300" />
      </div>
      <p className="font-semibold text-gray-500">
        {search ? `No schools found for "${search}"` : "No schools yet"}
      </p>
    </div>
  );
}

// ── Grid ───────────────────────────────────────────────────────────────────────
type Props = {
  schools: SuperAdminSchool[];
  search: string;
};

export function PlatformSchoolsListGrid({ schools, search }: Props) {
  if (schools.length === 0) return <EmptyState search={search} />;
  return (
    <div className="grid gap-3">
      {schools.map((school) => (
        <SchoolRow key={school.id} school={school} />
      ))}
    </div>
  );
}
