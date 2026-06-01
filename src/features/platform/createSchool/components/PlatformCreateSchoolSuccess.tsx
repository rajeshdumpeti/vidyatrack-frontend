import { useMemo } from "react";
import { CheckCircle2, School, ShieldAlert } from "lucide-react";

import type { SuperadminSchoolCreateResponse } from "@/api/superadminSchools.api";

export function PlatformCreateSchoolSuccess({
  data,
  onBackToSchools,
  onCreateAnother,
}: {
  data: SuperadminSchoolCreateResponse;
  onBackToSchools: () => void;
  onCreateAnother: () => void;
}) {
  const rows = useMemo(() => {
    const sms = data.data.management_admin.sms_delivered;
    const email = data.data.management_admin.email_delivered;
    return [
      {
        label: "Credentials via SMS/WhatsApp",
        ok: sms,
        reason: data.data.management_admin.sms_error ?? null,
      },
      {
        label: "Credentials via Email",
        ok: email,
        reason: data.data.management_admin.email_error ?? null,
      },
      {
        label: `Grades created (${data.data.grades_created.length})`,
        ok: data.data.grades_created.length > 0,
        reason: null,
      },
    ];
  }, [data]);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">School onboarded</h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              VT School ID: <span className="font-semibold text-gray-900">{data.data.vt_school_id}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToSchools}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back to Schools
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <School className="h-4 w-4 text-gray-500" />
              School
            </div>
            <div className="text-sm text-gray-700">
              <div className="font-semibold text-gray-900">{data.data.school_name}</div>
              <div className="mt-1">Plan: Pilot</div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <ShieldAlert className="h-4 w-4 text-gray-500" />
              Management Admin
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div>Full name: <span className="font-semibold text-gray-900">{data.data.management_admin.full_name}</span></div>
              <div>Phone: <span className="font-semibold text-gray-900">{data.data.management_admin.login_phone}</span></div>
              {data.data.management_admin.login_email ? (
                <div>Email: <span className="font-semibold text-gray-900">{data.data.management_admin.login_email}</span></div>
              ) : null}
              <p className="text-xs text-gray-500">
                Credentials delivery is confirmed below. Use “Reset Password” from School Detail if needed.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className={[
                "rounded-xl border px-4 py-3",
                row.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-800",
              ].join(" ")}
            >
              <div className="text-sm font-semibold">
                {row.ok ? "✓ " : "• "}
                {row.label}
              </div>
              {!row.ok && row.reason ? (
                <div className="mt-1 text-xs font-medium opacity-80">
                  Not delivered: {row.reason}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCreateAnother}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Create another school
          </button>
          <button
            type="button"
            onClick={onBackToSchools}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
