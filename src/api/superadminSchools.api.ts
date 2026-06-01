import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export type SuperadminSchoolCreatePayload = {
  school_identity: {
    school_name: string;
    school_code: string | null;
    board: string;
    category: string;
    medium: string;
    school_type: string;
    established_year: number | null;
    affiliation_number: string | null;
    udise_code: string | null;
  };
  location_contact: {
    street_address: string;
    area: string | null;
    city: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
    landmark: string | null;
    latitude: number | null;
    longitude: number | null;
    school_phone: string;
    school_email: string;
    website: string | null;
  };
  management_admin: {
    first_name: string;
    last_name: string;
    designation: string | null;
    department: string | null;
    employee_id: string | null;
    phone: string;
    email: string;
    language: string;
    timezone: string;
    send_credentials_via: "sms" | "email" | "both";
  };
  academic_baseline: {
    current_session: string;
    academic_start_month: "april" | "june" | "july";
    academic_end_month: "march" | "may";
    working_days_per_week: 5 | 6;
    class_levels_enabled: string[];
  };
  modules_limits: {
    modules: Record<string, boolean>;
    limits: {
      max_students: number;
      max_teachers: number;
      max_staff: number;
      storage_limit_gb: number;
    };
    features: {
      api_access: boolean;
      bulk_operations: boolean;
      custom_reports: boolean;
    };
  };
  plan_info: {
    plan_type: "pilot" | "starter" | "standard" | "premium";
    is_test: boolean;
    trial_days: number;
    billing_start_date: string | null;
  };
  idempotencyKey?: string;
};

export type SuperadminSchoolCreateResponse = {
  success: true;
  data: {
    school_id: string;
    vt_school_id: string;
    school_name: string;
    grades_created: string[];
    management_admin: {
      user_id: string;
      full_name: string;
      login_phone: string;
      login_email: string;
      sms_delivered: boolean;
      email_delivered: boolean;
      sms_error?: string | null;
      email_error?: string | null;
      is_first_login: boolean;
    };
    setup_next_steps: string[];
  };
};

export async function createSuperadminSchool(
  payload: SuperadminSchoolCreatePayload,
): Promise<SuperadminSchoolCreateResponse> {
  const { idempotencyKey, ...body } = payload;
  const res = await apiClient.post<SuperadminSchoolCreateResponse>(
    API_ENDPOINTS.superadmin.schoolsCreate,
    body,
    idempotencyKey ? { headers: { "Idempotency-Key": idempotencyKey } } : undefined,
  );
  return res.data;
}

export type SuperadminSchoolDetailResponse = {
  success: true;
  data: {
    school: {
      id: string;
      vt_school_id: string;
      name: string;
      school_code: string | null;
      status: string;
      plan_type: string;
      is_test: boolean;
      created_at: string | null;
      suspended_at: string | null;
      suspension_reason: string | null;
      board?: string | null;
      category?: string | null;
      medium?: string | null;
      school_type?: string | null;
      established_year?: number | null;
      affiliation_number?: string | null;
      udise_code?: string | null;
    };
    setup: {
      setup_completion_pct: number;
      breakdown?: Record<string, boolean>;
      counts?: Record<string, number>;
    };
    management_admin: {
      user_id: string;
      full_name: string | null;
      phone: string | null;
      email: string | null;
      first_name?: string | null;
      last_name?: string | null;
      designation: string | null;
      department: string | null;
      employee_id: string | null;
      last_login_at: string | null;
      never_logged_in: boolean;
    } | null;
    stats: {
      total_students: number;
      total_teachers: number;
      total_staff: number;
      total_registered: number;
    };
    recent_activity?: Array<{
      event_type: string;
      description: string;
      performed_by: string;
      performed_at: string | null;
    }>;
    academic: {
      current_session: string | null;
      academic_start_month: number | null;
      academic_end_month: number | null;
      working_days_per_week: number | null;
      class_levels: string[];
      grades: { grade_name: string; grade_code: string }[];
    };
    contact: {
      street_address: string | null;
      area: string | null;
      city: string | null;
      district: string | null;
      state: string | null;
      pincode: string | null;
      country: string | null;
      landmark: string | null;
      latitude: number | null;
      longitude: number | null;
      school_phone: string | null;
      school_email: string | null;
      website: string | null;
    };
    modules_limits: {
      modules: Record<string, boolean>;
      limits: Record<string, number | null>;
      features: Record<string, boolean>;
    };
  };
};

export async function getSuperadminSchoolDetail(
  schoolId: string,
): Promise<SuperadminSchoolDetailResponse> {
  const res = await apiClient.get<SuperadminSchoolDetailResponse>(
    API_ENDPOINTS.superadmin.schoolDetail(schoolId),
  );
  return res.data;
}

export async function suspendSuperadminSchool(schoolId: string, payload: { reason: string; notify_management: boolean }) {
  const res = await apiClient.post(API_ENDPOINTS.superadmin.suspendSchool(schoolId), payload);
  return res.data;
}

export async function reactivateSuperadminSchool(schoolId: string, payload: { notify_management: boolean }) {
  const res = await apiClient.post(API_ENDPOINTS.superadmin.reactivateSchool(schoolId), payload);
  return res.data;
}

export async function resetManagementPassword(schoolId: string, payload: { user_id: string; send_via: "sms" | "email" | "both"; reason?: string | null }) {
  const res = await apiClient.post(API_ENDPOINTS.superadmin.resetManagementPassword(schoolId), payload);
  return res.data;
}

export async function updateSuperadminSchool(schoolId: string, payload: { is_test: boolean }) {
  const res = await apiClient.patch(API_ENDPOINTS.superadmin.updateSchool(schoolId), payload);
  return res.data;
}

export async function updateSuperadminSchoolModules(
  schoolId: string,
  payload: { modules: Record<string, boolean> },
) {
  const res = await apiClient.patch(
    API_ENDPOINTS.superadmin.updateSchoolModules(schoolId),
    payload,
  );
  return res.data as {
    success: true;
    data: { school_id: string; modules_enabled: string[]; modules: Record<string, boolean> };
  };
}

export async function editSuperadminSchool(
  schoolId: string,
  payload: SuperadminSchoolCreatePayload,
): Promise<SuperadminSchoolDetailResponse> {
  const { idempotencyKey: _ignore, ...body } = payload;
  const res = await apiClient.put<SuperadminSchoolDetailResponse>(
    API_ENDPOINTS.superadmin.schoolEdit(schoolId),
    body,
  );
  return res.data;
}
