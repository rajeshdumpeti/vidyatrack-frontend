import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, CheckCircle2, IndianRupee, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { getManagementSchoolsOverview } from "@/api/managementSchools.api";
import { useAuthStore } from "@/store/auth.store";

function formatINR(value: number) {
  return `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
}

export function ManageSchoolsPage() {
  const activeSchoolId = useAuthStore((state) => state.schoolId);
  const setActiveSchool = useAuthStore((state) => state.setActiveSchool);
  const overviewQuery = useQuery({
    queryKey: ["management-schools-overview"],
    queryFn: getManagementSchoolsOverview,
  });

  const summaryCards = overviewQuery.data
    ? [
        {
          label: "Schools",
          value: overviewQuery.data.data.summary.total_schools,
          icon: Building2,
        },
        {
          label: "Students",
          value: overviewQuery.data.data.summary.total_students,
          icon: Users,
        },
        {
          label: "Monthly Collection",
          value: formatINR(overviewQuery.data.data.summary.monthly_collection),
          icon: IndianRupee,
        },
        {
          label: "Pending Collection",
          value: formatINR(overviewQuery.data.data.summary.pending_collection),
          icon: IndianRupee,
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Multi-School Overview
        </p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Managed schools</h1>
            <p className="mt-2 text-sm text-slate-600">
              Review setup, operations, collections, and switch active context for any linked school.
            </p>
          </div>
          <Link
            to="/management"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <card.icon className="h-5 w-5 text-slate-500" />
            <div className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              {card.label}
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{card.value}</div>
          </article>
        ))}
      </section>

      {overviewQuery.isLoading ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Loading schools…
        </section>
      ) : null}

      {overviewQuery.isError ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700 shadow-sm">
          Could not load the school portfolio right now.
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-2">
        {(overviewQuery.data?.data.schools ?? []).map((school) => {
          const isActive = school.school_id === activeSchoolId;
          return (
            <article
              key={school.school_id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black text-slate-900">{school.school_name}</h2>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">
                      {school.status}
                    </span>
                    {isActive ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        Active school
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    {[school.school_code, school.board, school.category].filter(Boolean).join(" • ") || "Profile details pending"}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {[school.city, school.state].filter(Boolean).join(", ") || "Location not set"}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Setup
                  </div>
                  <div className="mt-1 text-2xl font-black text-slate-900">
                    {school.setup_completion_pct}%
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Students</div>
                  <div className="mt-2 text-xl font-black text-slate-900">{school.student_count}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Teachers</div>
                  <div className="mt-2 text-xl font-black text-slate-900">{school.teacher_count}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Attendance</div>
                  <div className="mt-2 text-xl font-black text-slate-900">{school.attendance_pct}%</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Current Session</div>
                  <div className="mt-2 text-base font-bold text-slate-900">
                    {school.current_session || "Not set"}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Fees</div>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>Collected this month</span>
                      <span className="font-bold">{formatINR(school.fee_collected_mtd)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pending</span>
                      <span className="font-bold">{formatINR(school.fee_pending)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Leadership</div>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>Principal</span>
                      <span className="font-bold">{school.principal_name || "Not assigned"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total staff</span>
                      <span className="font-bold">{school.staff_count}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Enabled modules</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {school.modules_enabled.length ? (
                    school.modules_enabled.map((module) => (
                      <span
                        key={`${school.school_id}-${module}`}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700"
                      >
                        {module.replaceAll("_", " ")}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No modules assigned</span>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSchool(school.school_id)}
                  className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  {isActive ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Active now
                    </>
                  ) : (
                    "Switch to this school"
                  )}
                </button>
                <Link
                  to="/management/profile"
                  onClick={() => setActiveSchool(school.school_id)}
                  className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Open profile
                </Link>
                <Link
                  to="/management"
                  onClick={() => setActiveSchool(school.school_id)}
                  className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Open dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              <div className="mt-4 text-xs text-slate-500">
                Last activity:{" "}
                {school.last_activity_at
                  ? new Date(school.last_activity_at).toLocaleString()
                  : "No recent activity"}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
