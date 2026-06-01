export type ManagementStaffListItemDto = {
  user_id: number;
  role: string;
  name: string;
  employee_id: string;
  school_name: string;
  join_date?: string | null;
  monthly_salary: number;
  employment_type?: string | null;
  payment_mode?: string | null;
  payroll_status: string;
  contract_end_date?: string | null;
};

export type ManagementStaffListResponse = {
  items: ManagementStaffListItemDto[];
  total: number;
};

export type ManagementStaffStatsResponse = {
  monthly_payroll: number;
  active_staff: number;
  pending_payouts: number;
  next_pay_date: string;
  composition: {
    teaching_pct: number;
    admin_pct: number;
    support_pct: number;
  };
  contracts_expiring_soon: number;
};

export type ManagementStaffCompensationInput = {
  gross_salary: number;
  employment_type?: string;
  payment_mode?: string;
  payment_day?: number;
  date_of_joining?: string | null;
  contract_end_date?: string | null;
};

export type ManagementStaffPayrollProcessResponse = {
  success: boolean;
  processed_count: number;
  payroll_month: string;
  processed_at: string;
};
