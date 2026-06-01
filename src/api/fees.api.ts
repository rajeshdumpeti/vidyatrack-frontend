import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export type FeeHead = {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
};

export async function listFeeHeads(): Promise<FeeHead[]> {
  const res = await apiClient.get<FeeHead[]>(API_ENDPOINTS.fees.heads);
  return res.data;
}

export async function createFeeHead(payload: {
  name: string;
  code: string;
}): Promise<FeeHead> {
  const res = await apiClient.post<FeeHead>(API_ENDPOINTS.fees.heads, payload);
  return res.data;
}

export async function listFeeCategories(): Promise<FeeHead[]> {
  const res = await apiClient.get<FeeHead[]>(API_ENDPOINTS.fees.categories);
  return res.data;
}

export async function createFeeCategory(payload: { name: string }): Promise<FeeHead> {
  const res = await apiClient.post<FeeHead>(API_ENDPOINTS.fees.categories, payload);
  return res.data;
}

export type FeeStructureItem = {
  fee_head_id: number;
  fee_head_code: string | null;
  fee_head_name: string | null;
  amount: number;
};

export type FeeStructure = {
  id: number;
  name: string | null;
  session: string;
  grade_name: string;
  is_active: boolean;
  total_amount: number;
  items: FeeStructureItem[];
};

export async function listFeeStructures(): Promise<FeeStructure[]> {
  const res = await apiClient.get<{ success: true; data: FeeStructure[] }>(
    API_ENDPOINTS.fees.structures,
  );
  return res.data.data;
}

export async function createFeeStructure(payload: {
  name?: string | null;
  session: string;
  grade_name: string;
  items: { fee_head_id: number; amount: number }[];
}): Promise<{ id: number }> {
  const res = await apiClient.post<{ success: true; data: { id: number } }>(
    API_ENDPOINTS.fees.structures,
    payload,
  );
  return res.data.data;
}

export async function listFeePlans(): Promise<FeeStructure[]> {
  const res = await apiClient.get<{ success: true; data: FeeStructure[] }>(
    API_ENDPOINTS.fees.plans,
  );
  return res.data.data;
}

export async function createFeePlan(payload: {
  name?: string | null;
  session: string;
  grade_name: string;
  items: { fee_head_id: number; amount: number }[];
}): Promise<{ id: number }> {
  const res = await apiClient.post<{ success: true; data: { id: number } }>(
    API_ENDPOINTS.fees.plans,
    payload,
  );
  return res.data.data;
}

export type FeeDue = {
  student: {
    id: number;
    name: string;
    roll_number: string | null;
    section: string | null;
    grade_name: string;
  };
  plan: {
    fee_structure_id: number;
    session: string;
    grade_name: string;
    items: Array<{ fee_head_id: number; category_name: string; amount: number }>;
    total_due: number;
  };
  summary: {
    total_paid: number;
    balance_due: number;
    status: "paid_in_full" | "partial" | "pending";
  };
};

export async function getFeeDue(params: { student_id: number; session: string }): Promise<FeeDue> {
  const res = await apiClient.get<{ success: true; data: FeeDue }>(API_ENDPOINTS.fees.due, { params });
  return res.data.data;
}

export type PaymentMode = "cash" | "upi" | "bank_transfer" | "cheque";

export type FeePayment = {
  id: number;
  receipt_number: string;
  session: string;
  student_id: number;
  amount_paid: number;
  payment_mode: PaymentMode;
  payment_date: string;
  note: string | null;
  recorded_by: string | null;
  items: Array<{ fee_head_id: number; category_name: string; amount: number }>;
};

export async function recordFeePayment(payload: {
  student_id: number;
  session: string;
  amount_paid: number;
  payment_mode: PaymentMode;
  payment_date: string;
  note?: string | null;
  items?: Array<{ fee_head_id: number; amount: number }> | null;
}): Promise<{ payment: FeePayment; summary: FeeDue["summary"] }> {
  const res = await apiClient.post<{ success: true; data: { payment: FeePayment; summary: FeeDue["summary"] } }>(
    API_ENDPOINTS.fees.payments,
    payload,
  );
  return res.data.data;
}

export type FeeLedgerRow = {
  payment_id: number;
  payment_date: string;
  student_id: number;
  student_name: string | null;
  grade_name: string | null;
  section: string | null;
  amount_paid: number;
  payment_mode: PaymentMode | string;
  receipt_number: string;
  session: string;
};

export type FeeLedger = {
  rows: FeeLedgerRow[];
  totals: { collected_today: number; collected_this_month: number };
};

export async function listFeePayments(params?: {
  session?: string;
  student_id?: number;
  grade_name?: string;
  payment_mode?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
}): Promise<FeeLedger> {
  const res = await apiClient.get<{ success: true; data: FeeLedger }>(API_ENDPOINTS.fees.payments, { params });
  return res.data.data;
}

export type FeeReceipt = {
  receipt: {
    receipt_number: string;
    payment_date: string;
    payment_mode: string;
    amount_paid: number;
    note: string | null;
    session: string;
  };
  school: {
    name: string | null;
    vt_school_id: string | null;
    phone: string | null;
    email: string | null;
    address: {
      street: string | null;
      area: string | null;
      city: string | null;
      district: string | null;
      state: string | null;
      pincode: string | null;
    };
  };
  student: {
    name: string | null;
    roll_number: string | null;
    section: string | null;
    class: string | null;
  };
  items: Array<{ category: string; amount: number }>;
  received_by: string | null;
};

export async function getFeeReceipt(paymentId: number | string): Promise<FeeReceipt> {
  const res = await apiClient.get<{ success: true; data: FeeReceipt }>(API_ENDPOINTS.fees.receipt(paymentId));
  return res.data.data;
}
