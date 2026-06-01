import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BellRing, Download, KeyRound, Settings2, UserCog } from "lucide-react";
import { useState } from "react";

import { getManagementPrincipalBySchool } from "@/api/managementPrincipal.api";
import {
  getManagementNotificationPreferences,
  resetManagedUserPassword,
  updateManagementNotificationPreferences,
} from "@/api/managementSettings.api";
import { listTeachers } from "@/api/teachers.api";
import { API_ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/store/auth.store";

export function ManagementSettingsPage() {
  const schoolId = useAuthStore((state) => state.schoolId);
  const queryClient = useQueryClient();
  const [lastReset, setLastReset] = useState<{
    name: string;
    tempPassword: string;
  } | null>(null);

  const notificationsQuery = useQuery({
    queryKey: ["management-settings-notifications", schoolId],
    queryFn: () => getManagementNotificationPreferences(schoolId!),
    enabled: Boolean(schoolId),
  });
  const principalQuery = useQuery({
    queryKey: ["management-settings-principal", schoolId],
    queryFn: () => getManagementPrincipalBySchool(schoolId!),
    enabled: Boolean(schoolId),
  });
  const teachersQuery = useQuery({
    queryKey: ["management-settings-teachers", schoolId],
    queryFn: () => listTeachers(schoolId!, { limit: 100 }),
    enabled: Boolean(schoolId),
  });

  const saveNotifications = useMutation({
    mutationFn: (payload: NonNullable<typeof notificationsQuery.data>) =>
      updateManagementNotificationPreferences(schoolId!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["management-settings-notifications", schoolId],
      });
    },
  });

  const resetPassword = useMutation({
    mutationFn: (userId: number) => resetManagedUserPassword(schoolId!, userId),
    onSuccess: (data) => {
      setLastReset({
        name: data.full_name || data.login_phone || data.login_email || `User ${data.user_id}`,
        tempPassword: data.temp_password,
      });
    },
  });

  const prefs = notificationsQuery.data;
  const teachers = teachersQuery.data?.data ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Settings2 className="h-6 w-6 text-slate-500" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Settings
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
              School settings
            </h1>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">School Profile & Academic Year</h2>
          <p className="mt-2 text-sm text-slate-600">
            Manage identity, contact details, session, grades, and academic months from the profile screen.
          </p>
          <a
            href="/management/profile"
            className="mt-5 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
          >
            Open profile editor
          </a>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-black text-slate-900">Notification Preferences</h2>
          </div>
          <div className="mt-5 space-y-4">
            {[
              ["fee_overdue", "Fee overdue alerts"],
              ["attendance_drop", "Attendance drop alerts"],
              ["staff_appraisal", "Staff appraisal reminders"],
              ["principal_updates", "Principal follow-up alerts"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(prefs?.[key as keyof typeof prefs])}
                  onChange={(e) =>
                    notificationsQuery.data &&
                    queryClient.setQueryData(
                      ["management-settings-notifications", schoolId],
                      {
                        ...notificationsQuery.data,
                        [key]: e.target.checked,
                      },
                    )
                  }
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => prefs && saveNotifications.mutate(prefs)}
            className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
          >
            Save preferences
          </button>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-black text-slate-900">User Management</h2>
          </div>
          <div className="mt-5 space-y-3">
            {principalQuery.data ? (
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">{principalQuery.data.name}</div>
                  <div className="text-xs text-slate-500">Principal</div>
                </div>
                {principalQuery.data.user_id ? (
                  <button
                    type="button"
                    onClick={() => resetPassword.mutate(principalQuery.data?.user_id ?? 0)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    Reset password
                  </button>
                ) : null}
              </div>
            ) : null}
            {teachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">{teacher.name}</div>
                  <div className="text-xs text-slate-500">
                    Teacher {teacher.email ? `• ${teacher.email}` : ""}
                  </div>
                </div>
                {teacher.user_id ? (
                  <button
                    type="button"
                    onClick={() => resetPassword.mutate(teacher.user_id!)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    Reset password
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-black text-slate-900">Data Export</h2>
          </div>
          <div className="mt-5 space-y-3">
            <a
              href={`${API_ENDPOINTS.management.settingsExportStudents}?school_id=${schoolId ?? ""}`}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Export students CSV
            </a>
            <a
              href={`${API_ENDPOINTS.fees.exportCsv}?school_id=${schoolId ?? ""}`}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Export fee ledger CSV
            </a>
          </div>

          {lastReset ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-800">
                <KeyRound className="h-4 w-4" />
                Temporary password generated
              </div>
              <div className="mt-2 text-sm text-amber-900">{lastReset.name}</div>
              <div className="mt-1 font-mono text-lg text-amber-950">{lastReset.tempPassword}</div>
            </div>
          ) : null}
        </article>
      </section>
    </div>
  );
}
