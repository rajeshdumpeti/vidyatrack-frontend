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
    { label: "Students", to: "/teacher/students" },
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
    { label: "Setup Classes", to: "/management/setup/classes" },
    { label: "Setup Sections", to: "/management/setup/sections" },
    { label: "Subjects", to: "/management/setup/subjects" },
    { label: "Assign Subjects", to: "/management/setup/assign-subjects" },
    { label: "Attendance", to: "/management/attendance" },
    { label: "Marks", to: "/management/marks" },
    { label: "Students", to: "/management/students" },
    { label: "Teachers", to: "/management/teachers" },
    { label: "Onboard Teachers", to: "/management/setup/teachers" },
  ],
} as const;
