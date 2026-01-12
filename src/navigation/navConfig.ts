export type NavRole = "teacher" | "principal" | "management";

export type NavItem = {
  label: string;
  to: string;
};

export const NAV_ITEMS: Record<NavRole, NavItem[]> = {
  teacher: [
    { label: "Dashboard", to: "/teacher" },
    { label: "Mark Attendance", to: "/teacher/attendance" },
    { label: "Enter Marks", to: "/teacher/marks" },
  ],
  principal: [
    { label: "Dashboard", to: "/principal" },
    { label: "Attendance", to: "/principal/attendance" },
    { label: "Marks", to: "/principal/marks" },
    { label: "Students", to: "/principal/students" },
    { label: "Teachers", to: "/principal/teachers" },
  ],
  management: [
    { label: "Dashboard", to: "/management" },
    { label: "Setup Schools", to: "/management/setup/schools" },
    { label: "Attendance", to: "/management/attendance" },
    { label: "Marks", to: "/management/marks" },
    { label: "Students", to: "/management/students" },
    { label: "Teachers", to: "/management/teachers" },
  ],
} as const;
