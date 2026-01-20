export type AuthRole = "teacher" | "principal" | "management";

export type OtpCodeDigits = [string, string, string, string];

export type AuthLocationState = {
  phoneDigits?: string;
};

export type OtpVerifyResponse = {
  access_token: string;
  token_type: string;
};

export type AuthMeResponse = {
  id: number;
  role?: AuthRole | string | null;
  school_id?: number | null;
  teacher_id?: number | null;
  phone?: string | null;
  name?: string | null;
  email?: string | null;
};

export type OtpRequestBody = { phone: string };
export type OtpVerifyBody = { phone: string; otp: string };
