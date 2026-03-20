export const queryKeys = {
  academicSetup: (schoolId: number | null | undefined) =>
    ["academic-setup", schoolId ?? null] as const,
  classes: (schoolId: number | null | undefined) =>
    ["classes", schoolId ?? null] as const,
  sections: (schoolId: number | null | undefined) =>
    ["sections", schoolId ?? null] as const,
  subjects: (schoolId: number | null | undefined) =>
    ["subjects", schoolId ?? null] as const,
  managementPrincipal: (schoolId: number | null | undefined) =>
    ["management-principal", schoolId ?? null] as const,
  managementPrincipalHistory: (schoolId: number | null | undefined) =>
    ["management-principal-history", schoolId ?? null] as const,
  attendanceRoot: () => ["attendance"] as const,
  attendanceSection: () => ["teacher", "me", "attendance-section"] as const,
  attendanceBySectionDate: (
    sectionId: number | null | undefined,
    date: string | null | undefined,
    schoolId: number | null | undefined,
  ) => ["attendance", "section", sectionId ?? null, date ?? null, schoolId ?? null] as const,
  teachers: (schoolId: number | null | undefined) =>
    ["teachers", schoolId ?? null] as const,
  principalTeachers: (schoolId: number | null | undefined) =>
    ["principal-teachers", schoolId ?? null] as const,
  teachingAssignments: (
    schoolId: number | null | undefined,
    sectionId: number | null | undefined,
  ) => ["teaching-assignments", schoolId ?? null, { sectionId: sectionId ?? null }] as const,
  teacherMeAssignments: () => ["teacher", "me", "teaching-assignments"] as const,
  teacherReadiness: () => ["teacher", "me", "readiness"] as const,
  teacherContext: (schoolId: number | null | undefined) =>
    ["teacher", "me", "context", schoolId ?? null] as const,
  students: (schoolId: number | null | undefined) =>
    ["students", schoolId ?? null] as const,
  principalStudents: (
    sectionId: number | null | undefined,
    schoolId: number | null | undefined,
  ) => ["principal-students", { sectionId: sectionId ?? null, schoolId: schoolId ?? null }] as const,
  studentsBySection: (
    sectionId: number | null | undefined,
    schoolId: number | null | undefined,
  ) => ["students", "by-section", sectionId ?? null, schoolId ?? null] as const,
  studentsBySectionDetailed: (
    sectionId: number | null | undefined,
    schoolId: number | null | undefined,
  ) =>
    ["students", "by-section", "detailed", sectionId ?? null, schoolId ?? null] as const,
  studentNotes: (
    studentId: string | number | null | undefined,
    schoolId: number | null | undefined,
  ) => ["student-notes", studentId ?? null, schoolId ?? null] as const,
  studentProfile: (
    studentId: string | number | null | undefined,
    schoolId: number | null | undefined,
  ) => ["student", studentId ?? null, schoolId ?? null] as const,
  homeworkHistory: (
    sectionId: number | null | undefined,
    subjectId: number | null | undefined,
    schoolId: number | null | undefined,
  ) =>
    ["communications", "homework", sectionId ?? null, subjectId ?? null, schoolId ?? null] as const,
  parentMessagesHistory: (
    sectionId: number | null | undefined,
    schoolId: number | null | undefined,
  ) => ["communications", "parent-messages", sectionId ?? null, schoolId ?? null] as const,
  existingMarks: (args: {
    sectionId: number | null | undefined;
    subjectId: number | null | undefined;
    examType: string | null | undefined;
    schoolId: number | null | undefined;
  }) =>
    [
      "existing-marks",
      args.sectionId ?? null,
      args.subjectId ?? null,
      args.examType ?? null,
      args.schoolId ?? null,
    ] as const,
  principalMarks: (args: {
    sectionId: number | null | undefined;
    subjectId: number | null | undefined;
    examType: string | null | undefined;
    schoolId: number | null | undefined;
  }) =>
    [
      "principal-marks",
      {
        sectionId: args.sectionId ?? null,
        subjectId: args.subjectId ?? null,
        examType: args.examType ?? null,
        schoolId: args.schoolId ?? null,
      },
    ] as const,
  principalAttendance: (args: {
    date: string;
    sectionId: number | null | undefined;
    schoolId: number | null | undefined;
  }) =>
    [
      "principal-attendance",
      {
        date: args.date,
        sectionId: args.sectionId ?? null,
        schoolId: args.schoolId ?? null,
      },
    ] as const,
  platformSchoolDashboard: (schoolId: number | null | undefined) =>
    ["platform-school-dashboard", schoolId ?? null] as const,
  platformSchoolTeachers: (schoolId: number | null | undefined) =>
    ["platform-school-teachers", schoolId ?? null] as const,
  platformSchoolStudents: (schoolId: number | null | undefined) =>
    ["platform-school-students", schoolId ?? null] as const,
  platformSchoolStaff: (schoolId: number | null | undefined) =>
    ["platform-school-staff", schoolId ?? null] as const,
  platformSchoolDashboardFallback: (schoolId: number | null | undefined) =>
    ["platform-school-dashboard-fallback", schoolId ?? null] as const,
} as const;
