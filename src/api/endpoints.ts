/**
 * Central API endpoint paths (single source of truth).
 * Do not include baseURL here; baseURL comes from env via apiClient.
 */

export const API_ENDPOINTS = {
  auth: {
    otpRequest: "/api/v1/auth/otp/request",
    otpVerify: "/api/v1/auth/otp/verify",
  },
  teacher: {
    meAttendanceSection: "/api/v1/teacher/me/attendance-section",
  },
  students: {
    list: "/api/v1/students",
  },
  attendance: {
    create: "/api/v1/attendance",
    submit: "/api/v1/attendance/submit",
  },
  marks: {
    record: "/api/v1/marks/record",
    submit: "/api/v1/marks/submit",
  },
} as const;
