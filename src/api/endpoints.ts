/**
 * Central API endpoint paths (single source of truth).
 * Do not include baseURL here; baseURL comes from env via apiClient.
 */

export const API_ENDPOINTS = {
  auth: {
    me: "/api/v1/auth/me",
    otpRequest: "/api/v1/auth/otp/request",
    otpVerify: "/api/v1/auth/otp/verify",
  },
  students: {
    create: "/api/v1/students",
    list: "/api/v1/students",
    detail: (studentId: number) => `/api/v1/students/${studentId}`,
  },
  attendance: {
    list: "/api/v1/attendance",
    create: "/api/v1/attendance",
    submit: "/api/v1/attendance/submit",
  },
  marks: {
    record: "/api/v1/marks/record",
    submit: "/api/v1/marks/submit",
  },
  teachers: {
    list: "/api/v1/teachers",
    create: "/api/v1/teachers",
    me: "/api/v1/teachers/me",
    meTeachingAssignments: "/api/v1/teachers/me/teaching-assignments",
    meAttendanceSection: "/api/v1/teachers/me/attendance-section",
  },
  schools: {
    list: "/api/v1/schools",
    create: "/api/v1/schools",
  },
  classes: {
    list: "/api/v1/classes",
    create: "/api/v1/classes",
  },
  subjects: {
    list: "/api/v1/subjects",
    create: "/api/v1/subjects",
  },

  sections: {
    list: "/api/v1/sections",
    create: "/api/v1/sections",
  },
  teachingAssignments: {
    list: "/api/v1/teaching-assignments",
    create: "/api/v1/teaching-assignments",
  },
  studentNotes: {
    list: (studentId: number) => `/api/v1/students/${studentId}/notes`,
    create: (studentId: number) => `/api/v1/students/${studentId}/notes`,
  },

  management: {
    teachersCreate: "/api/v1/management/teachers",
  },
} as const;
