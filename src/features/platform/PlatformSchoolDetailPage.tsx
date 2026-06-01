import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, PauseCircle, Pencil, PlayCircle, ShieldAlert, Tag } from "lucide-react";

import {
  getSuperadminSchoolDetail,
  reactivateSuperadminSchool,
  resetManagementPassword,
  suspendSuperadminSchool,
  updateSuperadminSchool,
  updateSuperadminSchoolModules,
} from "@/api/superadminSchools.api";
import { InsightState } from "@/components/feedback/InsightState";

const PRD_MODULES = [
  "attendance",
  "exams",
  "fees",
  "reports",
] as const;

export function PlatformSchoolDetailPage() {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [suspendReason, setSuspendReason] = useState("");
  const [isEditingModules, setIsEditingModules] = useState(false);
  const [modulesDraft, setModulesDraft] = useState<Record<string, boolean>>({});

  const safeSchoolId = (schoolId || "").trim();
  const isValid = safeSchoolId.length > 10; // UUID-ish; backend also accepts VT id

  const detail = useQuery({
    queryKey: ["superadmin-school-detail", safeSchoolId],
    queryFn: () => getSuperadminSchoolDetail(safeSchoolId),
    enabled: isValid,
  });

  const school = detail.data?.data.school;
  const mgmt = detail.data?.data.management_admin;
  const setup = detail.data?.data.setup;
  const recentActivity = detail.data?.data.recent_activity ?? [];

  const currentModulesMap = detail.data?.data.modules_limits.modules ?? {};
  const enabledModules = useMemo(() => {
    return Object.entries(currentModulesMap).filter(([, v]) => v).map(([k]) => k);
  }, [currentModulesMap]);

  // Persist enabled modules for the AppShell sidebar when browsing in Super Admin school context.
  // This avoids wiring global queries into the app shell.
  useMemo(() => {
    if (!safeSchoolId) return null;
    try {
      sessionStorage.setItem(
        `vt_superadmin_school_modules_${safeSchoolId}`,
        JSON.stringify({ enabled: enabledModules }),
      );
    } catch {
      // ignore
    }
    return null;
  }, [safeSchoolId, enabledModules]);

  const suspendMut = useMutation({
    mutationFn: async () =>
      suspendSuperadminSchool(safeSchoolId, { reason: suspendReason.trim(), notify_management: true }),
    onSuccess: () => detail.refetch(),
  });

  const reactivateMut = useMutation({
    mutationFn: async () => reactivateSuperadminSchool(safeSchoolId, { notify_management: true }),
    onSuccess: () => detail.refetch(),
  });

  const markTestMut = useMutation({
    mutationFn: async (is_test: boolean) => updateSuperadminSchool(safeSchoolId, { is_test }),
    onSuccess: () => detail.refetch(),
  });

  const updateModulesMut = useMutation({
    mutationFn: async (modules: Record<string, boolean>) =>
      updateSuperadminSchoolModules(safeSchoolId, { modules }),
    onSuccess: async () => {
      setIsEditingModules(false);
      try {
        const nextEnabled = Object.entries(modulesDraft).filter(([, v]) => v).map(([k]) => k);
        sessionStorage.setItem(
          `vt_superadmin_school_modules_${safeSchoolId}`,
          JSON.stringify({ enabled: nextEnabled }),
        );
      } catch {
        // ignore
      }
      await detail.refetch();
    },
  });

  const resetPwdMut = useMutation({
    mutationFn: async () => {
      if (!mgmt?.user_id) throw new Error("No management admin");
      return resetManagementPassword(safeSchoolId, {
        user_id: mgmt.user_id,
        send_via: "sms",
        reason: "SuperAdmin reset from detail page",
      });
    },
  });

  const modulesOn = useMemo(() => {
    const m = currentModulesMap ?? {};
    return Object.entries(m).filter(([, v]) => v).map(([k]) => k);
  }, [currentModulesMap]);

  const startEditModules = () => {
    const base = Object.fromEntries(PRD_MODULES.map((m) => [m, Boolean(currentModulesMap[m])]));
    setModulesDraft(base);
    setIsEditingModules(true);
  };

  if (!isValid) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="font-semibold text-red-600">Invalid school id.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate("/superadmin/schools")}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Back to Schools
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/superadmin/schools/${safeSchoolId}/edit`)}
            disabled={!school}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Edit School
            </span>
          </button>
          <button
            type="button"
            onClick={() => detail.refetch()}
            className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Refresh
          </button>
        </div>
      </div>

      {detail.isLoading ? (
        <InsightState title="Loading school…" />
      ) : detail.isError || !school ? (
        <InsightState title="Could not load school detail" />
      ) : (
        <>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{school.name}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  VT School ID: <span className="font-semibold text-gray-900">{school.vt_school_id}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase text-gray-600">
                  {school.status}
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase text-blue-700">
                  {school.plan_type}
                </span>
                {school.is_test ? (
                  <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold uppercase text-yellow-700">
                    TEST
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-gray-900">Setup completion</div>
                <div className="text-sm font-bold text-gray-900">{setup?.setup_completion_pct ?? 0}%</div>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(100, Math.max(0, setup?.setup_completion_pct ?? 0))}%` }}
                />
              </div>

              <div className="mt-4 grid gap-2 text-sm text-gray-700">
                {[
                  { key: "classes_added", label: "Classes added", countKey: "classes" },
                  { key: "sections_added", label: "Sections created", countKey: "sections" },
                  { key: "subjects_added", label: "Subjects added", countKey: "subjects" },
                  { key: "teachers_registered", label: "Teachers registered", countKey: "teachers" },
                  { key: "students_enrolled", label: "Students enrolled", countKey: "students" },
                  { key: "fee_structure_set", label: "Fee structure set", countKey: "fee_structures" },
                ].map((item) => {
                  const ok = Boolean(setup?.breakdown?.[item.key]);
                  const count = setup?.counts?.[item.countKey];
                  return (
                    <div key={item.key} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={[
                            "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                            ok ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600",
                          ].join(" ")}
                        >
                          {ok ? "✓" : "•"}
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">
                        {typeof count === "number" ? count : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <ShieldAlert className="h-4 w-4 text-gray-500" />
                Management Admin
              </div>
              {mgmt ? (
                <div className="space-y-1 text-sm text-gray-700">
                  <div>Name: <span className="font-semibold text-gray-900">{mgmt.full_name ?? "—"}</span></div>
                  <div>Phone: <span className="font-semibold text-gray-900">{mgmt.phone ?? "—"}</span></div>
                  <div>Email: <span className="font-semibold text-gray-900">{mgmt.email ?? "—"}</span></div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => resetPwdMut.mutate()}
                      disabled={resetPwdMut.isPending || !mgmt.user_id}
                      className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                      Reset Password
                    </button>
                    {resetPwdMut.data?.data?.temporary_password ? (
                      <span className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                        <CheckCircle2 className="h-4 w-4 text-amber-700" />
                        Temp password: <span className="font-mono">{resetPwdMut.data.data.temporary_password}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No management admin found.</p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Tag className="h-4 w-4 text-gray-500" />
                Actions
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => markTestMut.mutate(!school.is_test)}
                  disabled={markTestMut.isPending}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {school.is_test ? "Mark as Real" : "Mark as Test"}
                </button>

                {school.status === "suspended" ? (
                  <button
                    type="button"
                    onClick={() => reactivateMut.mutate()}
                    disabled={reactivateMut.isPending}
                    className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      Reactivate School
                    </span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                      placeholder="Suspension reason (required)"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-400"
                    />
                    <button
                      type="button"
                      onClick={() => suspendMut.mutate()}
                      disabled={suspendMut.isPending || suspendReason.trim().length === 0}
                      className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <PauseCircle className="h-4 w-4" />
                        Suspend School
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-900">Recent activity</h2>
              <span className="text-xs font-semibold text-gray-500">Last 10 actions</span>
            </div>
            <div className="mt-4 space-y-2">
              {recentActivity.length ? (
                recentActivity.map((row, idx) => (
                  <div
                    key={`${row.event_type}-${idx}`}
                    className="flex flex-col justify-between gap-1 rounded-xl border border-gray-100 bg-white px-4 py-3 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">{row.description}</div>
                      <div className="truncate text-xs text-gray-500">
                        by <span className="font-semibold text-gray-700">{row.performed_by}</span>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-gray-500">
                      {row.performed_at ? new Date(row.performed_at).toLocaleString() : "—"}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No activity recorded yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-900">Modules Enabled</h2>
              <button
                type="button"
                onClick={() => (isEditingModules ? setIsEditingModules(false) : startEditModules())}
                disabled={updateModulesMut.isPending}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {isEditingModules ? "Cancel" : "Edit"}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {modulesOn.length ? (
                modulesOn.map((m) => (
                  <span key={m} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {m}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No modules enabled.</span>
              )}
            </div>

            {isEditingModules ? (
              <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Update modules</p>
                <p className="mt-1 text-xs text-gray-600">
                  Turning off a module immediately blocks its APIs and hides it from management/principal sidebar after next login.
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {PRD_MODULES.map((m) => (
                    <label key={m} className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(modulesDraft[m])}
                        onChange={(e) =>
                          setModulesDraft((prev) => ({ ...prev, [m]: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-gray-800">{m}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateModulesMut.mutate(modulesDraft)}
                    disabled={updateModulesMut.isPending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {updateModulesMut.isPending ? "Saving…" : "Save modules"}
                  </button>
                  {updateModulesMut.isError ? (
                    <span className="text-xs font-semibold text-red-600">
                      Failed to update modules.
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
