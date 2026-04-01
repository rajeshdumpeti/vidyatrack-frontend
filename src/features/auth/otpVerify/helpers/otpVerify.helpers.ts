import type { OtpCodeDigits } from "@/types/auth.types";

import type { OtpVerifyFormValues } from "../types/otpVerify.types";

export function toOtpDigits(values: OtpVerifyFormValues): OtpCodeDigits {
  return [values.d1, values.d2, values.d3, values.d4, values.d5, values.d6];
}
