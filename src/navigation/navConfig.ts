export type NavRole = "teacher" | "principal" | "management" | "super_admin";
export type NavItem = {
  label: string;
  to: string;
};

export const NAV_ITEMS: Record<NavRole, NavItem[]> = {
  super_admin: [
    { label: "Overview", to: "/platform" },
    { label: "School Directory", to: "/platform/schools" },
    { label: "Add School", to: "/platform/schools/new" },
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
    { label: "Students", to: "/principal/students" },
    { label: "Teachers", to: "/principal/teachers" },
  ],
  management: [
    { label: "Overview", to: "/management" },
    { label: "Academic Setup", to: "/management/setup/academic" },
    { label: "Principals", to: "/management/principals" },
    { label: "Onboard Staff", to: "/management/setup/teachers" },
    { label: "Students", to: "/management/students" },
    { label: "Teachers", to: "/management/teachers" },
    { label: "Attendance", to: "/management/attendance" },
    { label: "Exams", to: "/management/marks" },
  ],
} as const;
