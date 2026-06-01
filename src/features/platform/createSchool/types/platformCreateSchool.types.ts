export type OnboardingForm = {
  school_name: string;
  school_code: string;
  board: string;
  category: string;
  medium: string;
  school_type: string;
  established_year: string;
  affiliation_number: string;
  udise_code: string;
  street: string;
  area: string;
  city: string;
  district: string;
  state: string;
  pin_code: string;
  country: string;
  landmark: string;
  latitude: string;
  longitude: string;
  school_phone: string;
  school_email: string;
  website: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_designation: string;
  admin_department: string;
  admin_employee_id: string;
  admin_phone: string;
  admin_phone_country: string;
  admin_email: string;
  send_credentials_via: "sms" | "email" | "both";
  language_preference: string;
  timezone: string;
  current_session: string;
  academic_start_month: string;
  academic_end_month: string;
  working_days_per_week: string;
  class_levels: string[];
  lkg_available: boolean;
  ukg_available: boolean;
  pre_nursery_available: boolean;
  modules_enabled: string[];
  max_students: string;
  max_teachers: string;
  max_staff: string;
  storage_limit_gb: string;
  api_access: boolean;
  bulk_operations: boolean;
  custom_reports: boolean;
};

export type PlatformCreateSchoolStep =
  | "School Identity"
  | "Location & Contact"
  | "Management Admin"
  | "Academic Baseline"
  | "Modules & Limits"
  | "Review & Confirm";
