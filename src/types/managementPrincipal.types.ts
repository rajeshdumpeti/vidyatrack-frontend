export type ManagementPrincipalDto = {
  principal_id: number;
  principal_public_id?: string;
  user_id: number;
  name: string;
  phone: string;
  email?: string | null;
};

export type ManagementPrincipalResult = ManagementPrincipalDto | null;

export type ManagementPrincipalRegisterInput = {
  school_id: number;
  name: string;
  phone: string;
  email?: string;
};

export type PrincipalOnboardingStartInput = ManagementPrincipalRegisterInput;

export type PrincipalOnboardingStartResult = {
  status: "otp_sent";
  session_id: number;
  phone_masked: string;
  expires_at: string;
  delivery_channel?: string | null;
  message: string;
};

export type PrincipalOnboardingResendInput = {
  school_id: number;
  session_id: number;
};

export type PrincipalOnboardingVerifyInput = {
  school_id: number;
  session_id: number;
  otp: string;
};

export type PrincipalHistoryItem = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  status: "DEACTIVATED" | "ACTIVE" | string;
  assigned_at: string;
  deactivated_at?: string | null;
};

export type PrincipalOnboardingVerifyResult = {
  status: "success";
  principal: ManagementPrincipalDto;
  deactivated_principals: PrincipalHistoryItem[];
  message: string;
};

export type ManagementPrincipalRegisterResult = {
  status: "success" | "partial_success";
  principal: ManagementPrincipalDto;
  otp_status: "sent" | "failed";
  delivery_channel?: string | null;
  otp_error_code?: string | null;
  message: string;
};

export type ManagementPrincipalRetryOtpResult = {
  status: "success" | "failed";
  delivery_channel?: string | null;
  otp_error_code?: string | null;
  message: string;
};

export type PrincipalDashboardDto = {
  pending_approvals: number;
  pending_attendance: number;
  today_events: boolean;
  total_students: number;
  total_teachers: number;
  attendance_today_pct: number;
  attendance_today_present: number;
  attendance_today_absent: number;
  attendance_today_total: number;
  notices: Array<{
    priority: string;
    id: string;
    title: string;
    message: string;
    created_at: string;
    kind: string;
  }>;
};
