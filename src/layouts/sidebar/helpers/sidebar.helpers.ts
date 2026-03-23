import {
  BookOpenText,
  Building2,
  CalendarClock,
  CirclePlus,
  ClipboardList,
  GraduationCap,
  House,
  LayoutGrid,
  NotebookPen,
  ShieldCheck,
  UserCog,
  Users,
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
  if (to === "/management" || to === "/principal" || to === "/platform") {
    return House;
  }
  if (to.includes("/setup/academic")) return LayoutGrid;
  if (to.includes("/setup/subjects")) return BookOpenText;
  if (to.includes("/setup/assign-subjects")) return ClipboardList;
  if (to.includes("/principals")) return ShieldCheck;
  if (to.includes("/setup/teachers")) return UserCog;
  if (to.includes("/students")) return Users;
  if (to.includes("/teachers")) return UserCog;
  if (to.includes("/attendance")) return CalendarClock;
  if (to.includes("/marks")) return GraduationCap;
  if (to.includes("/notes")) return NotebookPen;
  if (to.includes("/platform/schools/new")) return CirclePlus;
  if (to.includes("/platform/schools")) return Building2;
  return House;
}
