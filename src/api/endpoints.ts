/**
 * Central API endpoint paths (single source of truth).
 * Do not include baseURL here; baseURL comes from env via apiClient.
 */

export const API_ENDPOINTS = {
  auth: {
    me: "/api/v1/auth/me",
    otpRequest: "/api/v1/auth/otp/request",
    otpVerify: "/api/v1/auth/otp/verify",
    selectRole: "/api/v1/auth/select-role",
    // Password login
    login: "/api/v1/auth/login",
    verify2fa: "/api/v1/auth/verify-2fa",
    refresh: "/api/v1/auth/refresh",
    // Password reset
    forgotPassword: "/api/v1/auth/forgot-password",
    verifyResetOtp: "/api/v1/auth/verify-otp",
    resetPassword: "/api/v1/auth/reset-password",
  },
  students: {
    create: "/api/v1/students",
    list: "/api/v1/students",
    importPreview: "/api/v1/students/import/preview",
    importCommit: "/api/v1/students/import/commit",
    detail: (studentId: string) => `/api/v1/students/${studentId}`,
    notes: (studentId: string) => `/api/v1/students/${studentId}/notes`,
    reportCard: (studentId: string) => `/api/v1/students/${studentId}/report-card`,
  },
  attendance: {
    create: "/api/v1/attendance",
    submit: "/api/v1/attendance/submit",
    list: "/api/v1/attendance",
    update: (
      attendanceId: number,
      schoolId: number,
      studentId: number,
      date: string,
    ) =>
      `/api/v1/attendance/${attendanceId}?school_id=${schoolId}&student_id=${studentId}&date=${date}`,
  },
  marks: {
    record: "/api/v1/marks/record",
    submit: "/api/v1/marks/submit",
    list: "/api/v1/marks", // Add this line
  },
  communications: {
    homework: "/api/v1/communications/homework",
    parentMessage: "/api/v1/communications/parent-messages",
  },
  teachers: {
    list: "/api/v1/teachers",
    create: "/api/v1/teachers",
    updateStatus: (teacherId: number) => `/api/v1/teachers/${teacherId}/status`,
    me: "/api/v1/teachers/me",
    meReadiness: "/api/v1/teachers/me/readiness",
    meContext: "/api/v1/teachers/me/context",
    meTeachingAssignments: "/api/v1/teachers/me/teaching-assignments",
    meAttendanceSection: "/api/v1/teachers/me/attendance-section",
  },
  academicSetup: {
    list: "/api/v1/academic-setup",
  },
  schools: {
    list: "/api/v1/schools",
    create: "/api/v1/schools",
    dashboard: (schoolId: number) => `/api/v1/schools/${schoolId}/dashboard`,
    teachers: (schoolId: number) => `/api/v1/schools/${schoolId}/teachers`,
    students: (schoolId: number) => `/api/v1/schools/${schoolId}/students`,
    staff: (schoolId: number) => `/api/v1/schools/${schoolId}/staff`,
    pincode: (pincode: string) => `/api/v1/schools/pincode/${pincode}`,
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
    history: "/api/v1/teaching-assignments/history",
    substitute: (id: number) => `/api/v1/teaching-assignments/${id}/substitute`,
  },
  studentNotes: {
    list: (studentId: string) => `/api/v1/students/${studentId}/notes`,
    create: (studentId: string) => `/api/v1/students/${studentId}/notes`,
  },

  management: {
    dashboard: "/api/v1/management/dashboard",
    dashboardAlertAction: "/api/v1/management/dashboard/alerts/action",
    dashboardAlertHistory: "/api/v1/management/dashboard/alerts/history",
    schoolsOverview: "/api/v1/management/schools",
    portfolioStudentsSummary: "/api/v1/management/portfolio/students/summary",
    portfolioStudentsExport: "/api/v1/management/portfolio/students/export.csv",
    portfolioStaffSummary: "/api/v1/management/portfolio/staff/summary",
    portfolioStaffExport: "/api/v1/management/portfolio/staff/export.csv",
    staffList: "/api/v1/management/staff",
    staffStats: "/api/v1/management/staff/stats",
    staffCompensation: (userId: number) => `/api/v1/management/staff/${userId}/compensation`,
    staffPayrollProcess: "/api/v1/management/staff/payroll/process",
    settingsNotifications: "/api/v1/management/settings/notifications",
    settingsResetUserPassword: (userId: number) => `/api/v1/management/settings/users/${userId}/reset-password`,
    settingsExportStudents: "/api/v1/management/settings/export/students.csv",
    setupStatus: "/api/v1/management/setup/status",
    setupComplete: "/api/v1/management/setup/complete",
    sections: "/api/v1/management/sections",
    subjects: "/api/v1/management/subjects",
    teachersCreate: "/api/v1/management/teachers",
    principal: "/api/v1/management/principal",
    principalRegister: "/api/v1/management/principal/register",
    principalRetryOtp: "/api/v1/management/principal/retry-otp",
    principalHistory: "/api/v1/management/principal/history",
    principalTimeline: "/api/v1/management/principal/timeline",
    principalOnboardingSession: "/api/v1/management/principal/onboarding/session",
    principalOnboardingStart: "/api/v1/management/principal/onboarding/start",
    principalOnboardingVerify: "/api/v1/management/principal/onboarding/verify",
    principalOnboardingResend: "/api/v1/management/principal/onboarding/resend",
    principalOnboardingCancel: "/api/v1/management/principal/onboarding/cancel",
  },
  principal: {
    dashboard: "/api/v1/principal/dashboard",
  },
  cms: {
    byContentType: (contentType: string) => `/api/v1/cms/${contentType}`,
  },
  superadmin: {
    dashboard: "/api/v1/superadmin/dashboard",
    schools: "/api/v1/superadmin/schools",
    checkPhone: "/api/v1/superadmin/check-phone",
    schoolsCreate: "/api/v1/superadmin/schools/create",
    schoolDetail: (schoolId: string) => `/api/v1/superadmin/schools/${schoolId}`,
    schoolEdit: (schoolId: string) => `/api/v1/superadmin/schools/${schoolId}/edit`,
    resetManagementPassword: (schoolId: string) =>
      `/api/v1/superadmin/schools/${schoolId}/reset-management-password`,
    suspendSchool: (schoolId: string) => `/api/v1/superadmin/schools/${schoolId}/suspend`,
    reactivateSchool: (schoolId: string) =>
      `/api/v1/superadmin/schools/${schoolId}/reactivate`,
    updateSchool: (schoolId: string) => `/api/v1/superadmin/schools/${schoolId}`,
    updateSchoolModules: (schoolId: string) => `/api/v1/superadmin/schools/${schoolId}/modules`,
  },
  fees: {
    heads: "/api/v1/fees/heads",
    structures: "/api/v1/fees/structures",
    categories: "/api/v1/fees/categories",
    plans: "/api/v1/fees/plans",
    due: "/api/v1/fees/due",
    payments: "/api/v1/fees/payments",
    receipt: (paymentId: number | string) => `/api/v1/fees/payments/${paymentId}/receipt`,
    exportCsv: "/api/v1/fees/payments/export.csv",
  },
} as const;
