import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, IndianRupee } from "lucide-react";
import { useState } from "react";

import {
  getManagementStaffList,
  getManagementStaffStats,
  patchManagementStaffCompensation,
  postManagementStaffPayrollProcess,
} from "@/api/managementStaff.api";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Toast } from "@/components/feedback/Toast";
import { useAuthStore } from "@/store/auth.store";

function formatINR(value: number) {
  return `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
}

export function ManagementStaffPage() {
  const queryClient = useQueryClient();
  const schoolId = useAuthStore((state) => state.schoolId);
  const [showSalary, setShowSalary] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const statsQuery = useQuery({
    queryKey: ["management-staff-stats", schoolId],
    queryFn: () => getManagementStaffStats({ school_id: schoolId }),
    enabled: Boolean(schoolId),
  });
  const listQuery = useQuery({
    queryKey: ["management-staff-list", schoolId],
    queryFn: () => getManagementStaffList({ school_id: schoolId }),
    enabled: Boolean(schoolId),
  });

  const processMutation = useMutation({
    mutationFn: (userId?: number) => postManagementStaffPayrollProcess({ school_id: schoolId, user_id: userId ?? null }),
    onSuccess: (data) => {
      setToast(`Processed ${data.processed_count} salary record(s)`);
      void queryClient.invalidateQueries({ queryKey: ["management-staff-stats", schoolId] });
      void queryClient.invalidateQueries({ queryKey: ["management-staff-list", schoolId] });
    },
  });

  const quickSetSalary = useMutation({
    mutationFn: ({ userId, salary }: { userId: number; salary: number }) =>
      patchManagementStaffCompensation(
        userId,
        {
          gross_salary: salary,
          payment_day: 1,
          payment_mode: "bank_transfer",
          employment_type: "permanent",
        },
        schoolId,
      ),
    onSuccess: () => {
      setToast("Salary profile updated");
      void queryClient.invalidateQueries({ queryKey: ["management-staff-stats", schoolId] });
      void queryClient.invalidateQueries({ queryKey: ["management-staff-list", schoolId] });
    },
  });

  const stats = statsQuery.data;
  const items = listQuery.data?.items ?? [];

  if (statsQuery.isLoading || listQuery.isLoading) return <LoadingState label="Loading staff data..." />;
  if (statsQuery.isError || listQuery.isError) {
    return <ErrorState title="Unable to load staff management" message="Please retry." />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Staff Management</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Payroll and staff directory</h1>
            <p className="mt-2 text-sm text-slate-600">Process salaries, review pending payouts, and manage teacher/principal compensation.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowSalary((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700"
            >
              {showSalary ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showSalary ? "Hide Salaries" : "Show Salaries"}
            </button>
            <button
              type="button"
              onClick={() => processMutation.mutate(undefined)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
            >
              <IndianRupee className="h-4 w-4" />
              Process Pending Payroll
            </button>
          </div>
        </div>
      </section>

      {stats ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Monthly Payroll</div>
            <div className="mt-2 text-2xl font-black text-slate-900">{formatINR(stats.monthly_payroll)}</div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Active Staff</div>
            <div className="mt-2 text-2xl font-black text-slate-900">{stats.active_staff}</div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Pending Payouts</div>
            <div className="mt-2 text-2xl font-black text-slate-900">{stats.pending_payouts}</div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Next Pay Cycle</div>
            <div className="mt-2 text-2xl font-black text-slate-900">{stats.next_pay_date}</div>
          </article>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Staff master list</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">Name</th>
                  <th className="pb-3 pr-4 font-semibold">Role</th>
                  <th className="pb-3 pr-4 font-semibold">Join Date</th>
                  <th className="pb-3 pr-4 font-semibold">Salary</th>
                  <th className="pb-3 pr-4 font-semibold">Payout</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={`${item.user_id}-${item.role}`} className="border-b border-slate-100">
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.employee_id}</div>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{item.role}</td>
                    <td className="py-3 pr-4 text-slate-600">{item.join_date ?? "—"}</td>
                    <td className="py-3 pr-4 text-slate-600">{showSalary ? formatINR(item.monthly_salary) : "••••••"}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        item.payroll_status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {item.payroll_status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const value = window.prompt(`Enter monthly salary for ${item.name}`, String(item.monthly_salary || 0));
                            if (!value) return;
                            const salary = Number(value);
                            if (Number.isNaN(salary)) return;
                            quickSetSalary.mutate({ userId: item.user_id, salary });
                          }}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"
                        >
                          Edit Salary
                        </button>
                        <button
                          type="button"
                          disabled={item.payroll_status === "PAID"}
                          onClick={() => processMutation.mutate(item.user_id)}
                          className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                        >
                          Process Salary
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Workforce composition</h2>
          {stats ? (
            <div className="mt-5 space-y-4">
              {[
                ["Teaching Staff", stats.composition.teaching_pct],
                ["Administrative", stats.composition.admin_pct],
                ["Support Staff", stats.composition.support_pct],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>{label}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-indigo-600" style={{ width: `${Math.min(Number(value), 100)}%` }} />
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                {stats.contracts_expiring_soon} contract(s) expiring in the next 30 days.
              </div>
            </div>
          ) : null}
        </article>
      </section>

      {toast ? <Toast variant="success" message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
