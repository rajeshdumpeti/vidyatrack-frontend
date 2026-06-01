import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";

import {
  createFeeCategory,
  createFeePlan,
  getFeeDue,
  listFeeCategories,
  listFeePayments,
  listFeePlans,
  recordFeePayment,
  type FeeHead,
  type PaymentMode,
} from "@/api/fees.api";
import { apiClient } from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";

type RoleMode = "management" | "principal";

function formatINR(amount: number) {
  return `₹ ${Number(amount || 0).toLocaleString("en-IN")}`;
}

function defaultSession() {
  const y = new Date().getFullYear();
  return `${y}-${y + 1}`;
}

function modeLabel(mode: PaymentMode) {
  if (mode === "cash") return "Cash";
  if (mode === "upi") return "UPI";
  if (mode === "bank_transfer") return "Bank Transfer";
  return "Cheque";
}

export function FeeManagementPage({
  roleMode,
  initialTab = "setup",
  setupOnly = false,
}: {
  roleMode: RoleMode;
  initialTab?: "setup" | "record" | "ledger";
  setupOnly?: boolean;
}) {
  const isManagement = roleMode === "management";
  const schoolId = useAuthStore((s) => s.schoolId);

  const categoriesQ = useQuery({ queryKey: ["fee-categories"], queryFn: listFeeCategories });
  const plansQ = useQuery({ queryKey: ["fee-plans"], queryFn: listFeePlans });

  const createCategoryMut = useMutation({
    mutationFn: createFeeCategory,
    onSuccess: async () => categoriesQ.refetch(),
  });

  const createPlanMut = useMutation({
    mutationFn: createFeePlan,
    onSuccess: async () => plansQ.refetch(),
  });

  // Academic setup (classes) → used as grade options
  const academicQ = useQuery({
    queryKey: ["academic-setup-for-fees"],
    queryFn: async () => {
      const res = await apiClient.get(API_ENDPOINTS.academicSetup.list);
      return res.data as { classes: Array<{ id: number; name: string }> };
    },
    enabled: Boolean(schoolId),
  });

  const gradeOptions = useMemo(() => {
    const rows = (academicQ.data?.classes ?? []).map((c) => c.name);
    const mapped = rows.map((name) => {
      const trimmed = (name || "").trim();
      if (/^\d+$/.test(trimmed)) return `Grade ${Number(trimmed)}`;
      return trimmed || name;
    });
    return Array.from(new Set(mapped)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [academicQ.data]);

  const categories = (categoriesQ.data ?? []) as FeeHead[];

  const [activeTab, setActiveTab] = useState<"setup" | "record" | "ledger">(initialTab);

  // Tab 1: setup
  const [newCategoryName, setNewCategoryName] = useState("");
  const [planSession, setPlanSession] = useState(defaultSession());
  const [planGrade, setPlanGrade] = useState("");
  const [planRows, setPlanRows] = useState<Array<{ fee_head_id: number; amount: string }>>([]);

  const planTotal = useMemo(() => {
    return planRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }, [planRows]);

  // Tab 2: record payment
  const [studentSearch, setStudentSearch] = useState("");
  const [studentResults, setStudentResults] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [session, setSession] = useState(defaultSession());
  const [dueError, setDueError] = useState<string | null>(null);

  const dueQ = useQuery({
    queryKey: ["fee-due", selectedStudentId, session],
    queryFn: () => getFeeDue({ student_id: selectedStudentId!, session }),
    enabled: Boolean(selectedStudentId) && session.length >= 4,
    retry: false,
  });

  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  const recordMut = useMutation({
    mutationFn: () =>
      recordFeePayment({
        student_id: selectedStudentId!,
        session,
        amount_paid: Number(amountPaid || 0),
        payment_mode: paymentMode,
        payment_date: new Date(paymentDate).toISOString(),
        note: note.trim() || null,
      }),
    onSuccess: (data) => {
      const pid = data.payment.id;
      const url = roleMode === "management"
        ? `/management/fees/receipt/${pid}`
        : `/principal/fees/receipt/${pid}`;
      window.open(url, "_blank", "noopener,noreferrer");
      void dueQ.refetch();
      void ledgerQ.refetch();
      setAmountPaid("");
      setNote("");
    },
  });

  // Student search (simple)
  const searchStudents = async () => {
    const term = studentSearch.trim();
    if (!term) return;
    const res = await apiClient.get(API_ENDPOINTS.students.list, { params: { search: term, limit: 10 } });
    const items = (res.data?.data ?? []) as Array<{ id: number; name: string }>;
    setStudentResults(items.map((s) => ({ id: s.id, name: s.name })));
  };

  // Tab 3: ledger
  const [ledgerSession, setLedgerSession] = useState<string>("");
  const [ledgerMode, setLedgerMode] = useState<string>("");
  const [ledgerStudentId, setLedgerStudentId] = useState<number | null>(null);

  const ledgerQ = useQuery({
    queryKey: ["fee-ledger", ledgerSession, ledgerMode, ledgerStudentId],
    queryFn: () =>
      listFeePayments({
        ...(ledgerSession ? { session: ledgerSession } : {}),
        ...(ledgerMode ? { payment_mode: ledgerMode } : {}),
        ...(ledgerStudentId ? { student_id: ledgerStudentId } : {}),
        limit: 200,
      }),
  });

  const canEditSetup = isManagement;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Fees</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isManagement
            ? "Fee Setup, Record Payments, and Ledger (manual-only)."
            : "Record Payments and Ledger (manual-only)."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("setup")}
          className={[
            "rounded-xl px-4 py-2 text-sm font-semibold",
            activeTab === "setup" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
          ].join(" ")}
        >
          Fee Setup
        </button>
        {!setupOnly ? (
          <button
            type="button"
            onClick={() => setActiveTab("record")}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold",
              activeTab === "record" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
            ].join(" ")}
          >
            Record Payment
          </button>
        ) : null}
        {!setupOnly ? (
          <button
            type="button"
            onClick={() => setActiveTab("ledger")}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold",
              activeTab === "ledger" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
            ].join(" ")}
          >
            Payment Ledger
          </button>
        ) : null}
      </div>

      {/* TAB 1: Setup */}
      {activeTab === "setup" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Fee Categories</h2>
                <p className="mt-1 text-xs text-gray-500">What types of fees does your school charge?</p>
              </div>
              {!canEditSetup && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">Read-only</span>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Tuition Fee"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                disabled={!canEditSetup}
              />
              <button
                type="button"
                onClick={() => createCategoryMut.mutate({ name: newCategoryName.trim() })}
                disabled={!canEditSetup || createCategoryMut.isPending || newCategoryName.trim().length < 2}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>

            <div className="mt-5">
              {categoriesQ.isLoading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-gray-500">No categories yet.</p>
              ) : (
                <ul className="space-y-2">
                  {categories.map((c) => (
                    <li key={c.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                      <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Fee Plans</h2>
                <p className="mt-1 text-xs text-gray-500">How much does each grade pay per session?</p>
              </div>
              {!canEditSetup && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">Read-only</span>
              )}
            </div>

            <div className="mt-4 grid gap-2">
              <input
                value={planSession}
                onChange={(e) => setPlanSession(e.target.value)}
                placeholder="Session (e.g. 2026-2027)"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                disabled={!canEditSetup}
              />

              <select
                value={planGrade}
                onChange={(e) => setPlanGrade(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                disabled={!canEditSetup}
              >
                <option value="">Select Grade</option>
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              <div className="mt-2 space-y-2">
                {(planRows.length ? planRows : [{ fee_head_id: 0, amount: "" }]).map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2">
                    <select
                      value={row.fee_head_id || ""}
                      onChange={(e) => {
                        const id = Number(e.target.value) || 0;
                        setPlanRows((prev) => {
                          const base = prev.length ? prev : [{ fee_head_id: 0, amount: "" }];
                          return base.map((r, i) => (i === idx ? { ...r, fee_head_id: id } : r));
                        });
                      }}
                      className="col-span-7 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                      disabled={!canEditSetup}
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <input
                      value={row.amount}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d]/g, "").slice(0, 7);
                        setPlanRows((prev) => {
                          const base = prev.length ? prev : [{ fee_head_id: 0, amount: "" }];
                          return base.map((r, i) => (i === idx ? { ...r, amount: v } : r));
                        });
                      }}
                      placeholder="Amount"
                      inputMode="numeric"
                      className="col-span-4 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                      disabled={!canEditSetup}
                    />
                    <button
                      type="button"
                      onClick={() => setPlanRows((prev) => prev.filter((_, i) => i !== idx))}
                      disabled={!canEditSetup || planRows.length <= 1}
                      className="col-span-1 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setPlanRows((prev) => [...(prev.length ? prev : [{ fee_head_id: 0, amount: "" }]), { fee_head_id: 0, amount: "" }])}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  disabled={!canEditSetup}
                >
                  + Add category
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                <span className="text-sm font-semibold text-gray-700">Total</span>
                <span className="text-sm font-bold text-gray-900">{formatINR(planTotal)}</span>
              </div>

              <button
                type="button"
                onClick={() =>
                  createPlanMut.mutate({
                    session: planSession.trim(),
                    grade_name: planGrade.trim(),
                    items: (planRows.length ? planRows : [])
                      .filter((r) => r.fee_head_id && r.amount !== "")
                      .map((r) => ({ fee_head_id: r.fee_head_id, amount: Number(r.amount) || 0 })),
                  })
                }
                disabled={
                  !canEditSetup ||
                  createPlanMut.isPending ||
                  planSession.trim().length < 4 ||
                  planGrade.trim().length < 1 ||
                  categories.length === 0 ||
                  (planRows.length ? planRows : []).filter((r) => r.fee_head_id && r.amount !== "").length === 0
                }
                className="mt-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {createPlanMut.isPending ? "Saving…" : "Save Fee Plan"}
              </button>
            </div>

            <div className="mt-5">
              {plansQ.isLoading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : (plansQ.data ?? []).length === 0 ? (
                <p className="text-sm text-gray-500">No plans yet.</p>
              ) : (
                <ul className="space-y-2">
                  {(plansQ.data ?? []).slice(0, 8).map((p) => (
                    <li key={p.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-gray-900">{p.grade_name} • {p.session}</div>
                        <div className="text-sm font-bold text-gray-900">{formatINR(p.total_amount)}</div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {p.items.slice(0, 3).map((it) => `${it.fee_head_name ?? "Category"} ${formatINR(it.amount)}`).join(" • ")}
                        {p.items.length > 3 ? " • …" : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Record Payment */}
      {activeTab === "record" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Search Student</h2>
            <p className="mt-1 text-xs text-gray-500">Search by name or ID. Select a student to load their fee plan.</p>
            <div className="mt-4 flex gap-2">
              <input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="e.g. Ramesh / 101 / VT-STU-..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
              <button
                type="button"
                onClick={() => void searchStudents()}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Search
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {studentResults.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { setSelectedStudentId(s.id); setDueError(null); }}
                  className={[
                    "w-full rounded-xl border px-3 py-2 text-left text-sm",
                    selectedStudentId === s.id ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-white hover:bg-gray-50",
                  ].join(" ")}
                >
                  <div className="font-semibold text-gray-900">{s.name}</div>
                  <div className="text-xs text-gray-500">Student ID: {s.id}</div>
                </button>
              ))}
              {studentResults.length === 0 ? (
                <p className="text-sm text-gray-500">No results yet.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Payment</h2>
            <div className="mt-3 grid gap-2">
              <input
                value={session}
                onChange={(e) => setSession(e.target.value)}
                placeholder="Session (e.g. 2026-2027)"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
              {dueQ.isError && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                  Fee plan not found for this student/session. Create a Fee Plan in Fee Setup.
                </p>
              )}

              {dueQ.data ? (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-900">{dueQ.data.student.name}</div>
                    <div className="text-xs font-semibold text-gray-600">{dueQ.data.student.grade_name} • {dueQ.data.plan.session}</div>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-gray-700">
                    <div className="flex justify-between"><span>Total Due</span><span className="font-bold text-gray-900">{formatINR(dueQ.data.plan.total_due)}</span></div>
                    <div className="flex justify-between"><span>Already Paid</span><span className="font-bold text-gray-900">{formatINR(dueQ.data.summary.total_paid)}</span></div>
                    <div className="flex justify-between"><span>Balance</span><span className="font-extrabold text-red-600">{formatINR(dueQ.data.summary.balance_due)}</span></div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    {dueQ.data.plan.items.map((it) => `${it.category_name} ${formatINR(it.amount)}`).join(" • ")}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Select a student to load fees.</p>
              )}

              <input
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value.replace(/[^\d]/g, "").slice(0, 7))}
                placeholder="Amount paid (₹)"
                inputMode="numeric"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                disabled={!dueQ.data}
              />

              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                disabled={!dueQ.data}
              >
                {(["cash", "upi", "bank_transfer", "cheque"] as PaymentMode[]).map((m) => (
                  <option key={m} value={m}>{modeLabel(m)}</option>
                ))}
              </select>

              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                disabled={!dueQ.data}
              />

              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder='Note (optional) e.g. "Cheque no. 123456"'
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                disabled={!dueQ.data}
              />

              <button
                type="button"
                onClick={() => recordMut.mutate()}
                disabled={!dueQ.data || recordMut.isPending || Number(amountPaid) <= 0}
                className="mt-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {recordMut.isPending ? "Recording…" : "Record & Generate Receipt"}
              </button>
              {recordMut.isError ? (
                <p className="text-sm font-semibold text-red-600">Failed to record payment.</p>
              ) : null}
              {dueError ? <p className="text-sm text-red-600">{dueError}</p> : null}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Ledger */}
      {activeTab === "ledger" && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Payment Ledger</h2>
              <p className="mt-1 text-xs text-gray-500">View all recorded payments. Filter by session/mode/student.</p>
            </div>
            <a
              href={API_ENDPOINTS.fees.exportCsv}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              title="Exports using current school context"
            >
              Export CSV
            </a>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-3">
            <input
              value={ledgerSession}
              onChange={(e) => setLedgerSession(e.target.value)}
              placeholder="Session (optional)"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
            <select
              value={ledgerMode}
              onChange={(e) => setLedgerMode(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
            >
              <option value="">All modes</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
            </select>
            <input
              value={ledgerStudentId ? String(ledgerStudentId) : ""}
              onChange={(e) => setLedgerStudentId(e.target.value.trim() ? Number(e.target.value) : null)}
              placeholder="Student ID (optional)"
              inputMode="numeric"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 px-4 py-3">
            <div className="text-sm font-semibold text-gray-700">
              Collected Today: <span className="font-extrabold text-gray-900">{formatINR(ledgerQ.data?.totals.collected_today ?? 0)}</span>
            </div>
            <div className="text-sm font-semibold text-gray-700">
              This Month: <span className="font-extrabold text-gray-900">{formatINR(ledgerQ.data?.totals.collected_this_month ?? 0)}</span>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Student</th>
                  <th className="px-3 py-2 text-left">Class</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-left">Mode</th>
                  <th className="px-3 py-2 text-left">Receipt</th>
                  <th className="px-3 py-2 text-right">Print</th>
                </tr>
              </thead>
              <tbody>
                {(ledgerQ.data?.rows ?? []).map((r) => (
                  <tr key={r.payment_id} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-700">{new Date(r.payment_date).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-gray-900 font-semibold">{r.student_name ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-700">{r.grade_name ?? "—"} {r.section ? `(${r.section})` : ""}</td>
                    <td className="px-3 py-2 text-right font-bold text-gray-900">{formatINR(r.amount_paid)}</td>
                    <td className="px-3 py-2 text-gray-700">{r.payment_mode}</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-700">{r.receipt_number}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const url = roleMode === "management"
                            ? `/management/fees/receipt/${r.payment_id}`
                            : `/principal/fees/receipt/${r.payment_id}`;
                          window.open(url, "_blank", "noopener,noreferrer");
                        }}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
                {(ledgerQ.data?.rows ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-500">
                      No payments recorded.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
