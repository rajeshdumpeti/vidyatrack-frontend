export type NavRole = "teacher" | "principal" | "management" | "super_admin";
export type NavItem = {
  label: string;
  to: string;
};

export const NAV_ITEMS: Record<NavRole, NavItem[]> = {
  super_admin: [
    { label: "Overview", to: "/superadmin/overview" },
    { label: "School Directory", to: "/superadmin/schools" },
    { label: "Add School", to: "/superadmin/schools/add" },
  ],
  teacher: [
    { label: "Overview", to: "/teacher" },
    { label: "Attendance", to: "/teacher/attendance" },
    { label: "Exams", to: "/teacher/marks" },
    { label: "Student Notes", to: "/teacher/notes" },
    { label: "Students", to: "/teacher/students" },
  ],
  principal: [
    { label: "Overview", to: "/principal" },
    { label: "Communication", to: "/principal/communication" },
    { label: "Attendance", to: "/principal/attendance" },
    { label: "Exams", to: "/principal/marks" },
    { label: "Fees", to: "/principal/fees" },
    { label: "Students", to: "/principal/students" },
    { label: "Teachers", to: "/principal/teachers" },
  ],
  management: [
    { label: "Overview", to: "/management" },
    { label: "Schools", to: "/management/schools" },
    { label: "Profile", to: "/management/profile" },
    { label: "Settings", to: "/management/settings" },
    { label: "Academic Setup", to: "/management/setup" },
    { label: "Enrollment", to: "/management/enrollment" },
    { label: "Staff", to: "/management/staff" },
    { label: "Principals", to: "/management/principals" },
    { label: "Onboard Staff", to: "/management/setup/teachers" },
    { label: "Fees", to: "/management/fees" },
    { label: "Communication", to: "/management/communication" },
    { label: "Reports", to: "/management/reports" },
    { label: "Attendance", to: "/management/attendance" },
    { label: "Exams", to: "/management/marks" },
  ],
} as const;
