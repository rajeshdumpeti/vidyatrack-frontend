import type { NavItem, NavRole } from "@/navigation/navConfig";

import type { AppShellBreadcrumb } from "../types/appShell.types";

export function buildAppShellBreadcrumbs(args: {
  pathname: string;
  locationState: { breadcrumbLabel?: string } | null;
  navItems: NavItem[];
  role: NavRole | null;
}): AppShellBreadcrumb[] {
  const activeItem = args.navItems.find((item) => item.to === args.pathname);
  const roleLabel =
    args.role === "management"
      ? "Management"
      : args.role === "principal"
        ? "Principal"
        : args.role === "super_admin"
          ? "Platform"
          : "Teacher";

  const rolePath =
    args.role === "management"
      ? "/management"
      : args.role === "principal"
        ? "/principal"
        : args.role === "super_admin"
          ? "/platform"
          : "/teacher";

  if (activeItem) {
    return [
      { label: roleLabel, to: rolePath },
      { label: activeItem.label },
    ];
  }

  const segments = args.pathname.split("/").filter(Boolean);
  if (!segments.length) return [{ label: roleLabel }];
  const rawTail = segments[segments.length - 1];
  const parentSegment = segments[segments.length - 2] ?? "";
  if (parentSegment === "students" || parentSegment === "teachers") {
    const parentLabel = parentSegment === "students" ? "Students" : "Teachers";
    return [
      { label: roleLabel, to: rolePath },
      { label: parentLabel, to: `${rolePath}/${parentSegment}` },
      {
        label:
          args.locationState?.breadcrumbLabel?.trim() ||
          (parentSegment === "students" ? "Student" : "Teacher"),
        to: args.pathname,
      },
    ];
  }

  const tail = /^\d+$/.test(rawTail)
    ? args.locationState?.breadcrumbLabel?.trim() || "Details"
    : rawTail.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  return [
    { label: roleLabel, to: rolePath },
    { label: tail },
  ];
}
