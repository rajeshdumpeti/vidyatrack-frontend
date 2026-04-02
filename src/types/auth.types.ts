export type AuthRole = "teacher" | "principal" | "management" | "super_admin";

export type OtpCodeDigits = [string, string, string, string, string, string];

export type SupportedCountryCode = "+91" | "+1";

export type AuthLocationState = {
  phoneDigits?: string;
  countryCode?: SupportedCountryCode;
  deliveryChannel?: "whatsapp" | "email";
};

// Define the School object structure
export type SchoolMapping = {
  id: number;
  name: string;
  role: AuthRole;
};

export type RoleOption = {
  school_id: number;
  school_name: string;
  role: AuthRole;
};

export type OtpVerifyResponse = {
  access_token: string;
  token_type: string;
  requires_role_selection: boolean;
  available_roles: RoleOption[];
};

export type SelectRoleBody = { school_id: number; role: string };
export type SelectRoleResponse = { access_token: string; token_type: string };

export type AuthMeResponse = {
  id: number;
  role: AuthRole;

  // The list of schools the user belongs to (Replaces 'schools: boolean')
  schools: SchoolMapping[];

  // This remains for backward compatibility or the currently active context
  school_id?: number | null;

  // Role-linked IDs
  teacher_id?: number | null;

  // Identity
  phone?: string | null;
  name?: string | null;
  email?: string | null;

  is_super_admin?: boolean;
};

export type OtpRequestBody = { phone: string };
export type OtpRequestResponse = {
  status: "otp_sent";
  delivery_channel: "whatsapp" | "email";
};
export type OtpVerifyBody = { phone: string; otp: string };
