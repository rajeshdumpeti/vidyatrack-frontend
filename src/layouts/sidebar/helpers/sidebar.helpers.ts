import {
  LayoutDashboard,
  LayoutGrid,
  BookOpenText,
  ClipboardList,
  ShieldCheck,
  UserCog,
  Users,
  CalendarClock,
  GraduationCap,
  NotebookPen,
  CirclePlus,
  Building2,
  IndianRupee,
  BarChart3,
  UserPlus,
  UserCircle2,
  Settings2,
} from "lucide-react";

import type { NavRole } from "@/navigation/navConfig";

export const sidebarLinkBase =
  "flex h-12 items-center px-4 text-sm font-semibold transition-colors duration-150";

export const sidebarRoleTitleMap: Record<NavRole, string> = {
  management: "Management",
  principal: "Principal",
  teacher: "Teacher",
  super_admin: "Platform Admin",
};

export function getSidebarNavIcon(to: string) {
  // 1. Core Dashboards (Replaced House with LayoutDashboard)
  if (to === "/management" || to === "/principal" || to === "/platform") {
    return LayoutDashboard;
  }
  if (to.includes("/profile")) return UserCircle2;
  if (to.includes("/settings")) return Settings2;
  if (to.includes("/schools")) return Building2;

  // 2. Academic & Setup
  if (to.includes("/setup/academic")) return LayoutGrid;
  if (to.includes("/setup/subjects")) return BookOpenText;
  if (to.includes("/setup/assign-subjects")) return ClipboardList;
  if (to.includes("/setup/teachers")) return UserCog;
  if (to.includes("/communication")) return BookOpenText;

  // 3. New Modules (Fixing the "House" repetition)
  if (to.includes("/fees")) return IndianRupee;
  if (to.includes("/reports")) return BarChart3;
  if (to.includes("/onboard")) return UserPlus;

  // 4. People & Attendance
  if (to.includes("/principals")) return ShieldCheck;
  if (to.includes("/enrollment")) return Users;
  if (to.includes("/staff")) return UserCog;
  if (to.includes("/students")) return Users;
  if (to.includes("/teachers")) return UserCog;
  if (to.includes("/attendance")) return CalendarClock;

  // 5. Academic Records
  if (to.includes("/marks") || to.includes("/exams")) return GraduationCap;
  if (to.includes("/notes")) return NotebookPen;

  // 6. Platform Admin
  if (to.includes("/platform/schools/new")) return CirclePlus;
  if (to.includes("/platform/schools")) return Building2;

  // Fallback (Consider using a generic 'Circle' or 'Menu' if House is too specific)
  return LayoutDashboard;
}
