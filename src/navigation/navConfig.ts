import {
  LayoutDashboard,
  UserCheck,
  FileSpreadsheet,
  StickyNote,
  Users,
  Settings,
  School,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

// 1. Explicitly export the type so AppShell can find it
export type NavRole = "teacher" | "principal" | "management";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon; // Use the official Lucide type instead of 'any'
};

// 2. Use Record<NavRole, NavItem[]> to allow string indexing
export const NAV_ITEMS: Record<NavRole, NavItem[]> = {
  teacher: [
    { label: "Dashboard", to: "/teacher", icon: LayoutDashboard },
    { label: "Attendance", to: "/teacher/attendance", icon: UserCheck },
    { label: "Marks", to: "/teacher/marks", icon: FileSpreadsheet },
    { label: "Notes", to: "/teacher/notes", icon: StickyNote },
  ],
  principal: [
    { label: "Dashboard", to: "/principal", icon: LayoutDashboard },
    { label: "Attendance", to: "/principal/attendance", icon: UserCheck },
    { label: "Marks", to: "/principal/marks", icon: FileSpreadsheet },
    { label: "Students", to: "/principal/students", icon: Users },
    { label: "Teachers", to: "/principal/teachers", icon: Users },
  ],
  management: [
    { label: "Dashboard", to: "/management", icon: LayoutDashboard },
    { label: "Schools", to: "/management/setup/schools", icon: School },
    { label: "Manage List", to: "/management/setup/classes", icon: Settings },
    // { label: "Subjects", to: "/management/setup/subjects", icon: BookOpen },
    // {
    //   label: "Assign Subjects",
    //   to: "/management/setup/assign-subjects",
    //   icon: BookOpen,
    // },
    {
      label: "Onboard Teachers",
      to: "/management/setup/teachers",
      icon: Users,
    },
    { label: "Students", to: "/management/students", icon: Users },
    { label: "Teachers", to: "/management/teachers", icon: Users },
    { label: "Attendance", to: "/management/attendance", icon: UserCheck },
    { label: "Marks", to: "/management/marks", icon: FileSpreadsheet },
  ],
};
