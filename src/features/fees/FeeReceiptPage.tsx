import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getFeeReceipt } from "@/api/fees.api";
import { InsightState } from "@/components/feedback/InsightState";

function formatINR(amount: number) {
  return `₹ ${Number(amount || 0).toLocaleString("en-IN")}`;
}

export function FeeReceiptPage() {
  const { paymentId } = useParams();
  const safeId = Number(paymentId);
  const enabled = Number.isFinite(safeId) && safeId > 0;

  const q = useQuery({
    queryKey: ["fee-receipt", safeId],
    queryFn: () => getFeeReceipt(safeId),
    enabled,
  });

  const data = q.data;

  const total = useMemo(() => {
    const items = data?.items ?? [];
    return items.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }, [data]);

  if (!enabled) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <InsightState title="Invalid receipt id" />
      </div>
    );
  }

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <InsightState title="Loading receipt…" />
      </div>
    );
  }

  if (q.isError || !data) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <InsightState title="Could not load receipt" />
      </div>
    );
  }

  const receipt = data.receipt;
  const school = data.school;
  const student = data.student;

  return (
    <div className="mx-auto max-w-3xl bg-white p-6 print:p-0">
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="text-xl font-extrabold text-gray-900">{school.name ?? "School"}</div>
          <div className="mt-1 text-xs text-gray-600">
            {[
              school.address.street,
              school.address.area,
              school.address.city,
              school.address.district,
              school.address.state,
              school.address.pincode,
            ]
              .filter(Boolean)
              .join(", ")}
          </div>
          <div className="mt-1 text-xs text-gray-600">
            {school.phone ? `Phone: ${school.phone}` : null}
            {school.email ? `  •  Email: ${school.email}` : null}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Receipt</div>
          <div className="mt-1 text-lg font-extrabold text-gray-900">{receipt.receipt_number}</div>
          <div className="mt-1 text-xs text-gray-600">
            Date: {new Date(receipt.payment_date).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Student</div>
          <div className="mt-2 space-y-1 text-sm text-gray-800">
            <div><span className="font-semibold">Name:</span> {student.name ?? "—"}</div>
            <div><span className="font-semibold">Class:</span> {student.class ?? "—"}</div>
            <div><span className="font-semibold">Section:</span> {student.section ?? "—"}</div>
            <div><span className="font-semibold">Roll No:</span> {student.roll_number ?? "—"}</div>
            <div><span className="font-semibold">Session:</span> {receipt.session}</div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Payment</div>
          <div className="mt-2 space-y-1 text-sm text-gray-800">
            <div><span className="font-semibold">Mode:</span> {receipt.payment_mode}</div>
            <div><span className="font-semibold">Amount Paid:</span> {formatINR(receipt.amount_paid)}</div>
            <div><span className="font-semibold">Received By:</span> {data.received_by ?? "—"}</div>
            {receipt.note ? (
              <div><span className="font-semibold">Note:</span> {receipt.note}</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Items</div>
        <div className="mt-3 overflow-hidden rounded-lg border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((row, idx) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-gray-800">{row.category}</td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-900">{formatINR(row.amount)}</td>
                </tr>
              ))}
              <tr className="border-t border-gray-200 bg-gray-50">
                <td className="px-3 py-2 text-right font-semibold text-gray-700">Total</td>
                <td className="px-3 py-2 text-right text-base font-extrabold text-gray-900">{formatINR(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div className="text-xs text-gray-500">
          This is a system-generated receipt.
        </div>
        <div className="w-56 text-right">
          <div className="border-t border-gray-300 pt-2 text-xs font-semibold text-gray-700">
            School Stamp / Signature
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Print
        </button>
      </div>
    </div>
  );
}

