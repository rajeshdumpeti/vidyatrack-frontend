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
    importPreview: "/api/v1/students/import/preview",
    importCommit: "/api/v1/students/import/commit",
    detail: (studentId: number) => `/api/v1/students/${studentId}`,
    notes: (studentId: number) => `/api/v1/students/${studentId}/notes`,
    reportCard: (studentId: number) => `/api/v1/students/${studentId}/report-card`,
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
  cms: {
    byContentType: (contentType: string) => `/api/v1/cms/${contentType}`,
  },
} as const;
