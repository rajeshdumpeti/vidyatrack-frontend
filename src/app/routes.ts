export const ROUTES = {
  auth: {
    login: "/auth/login",
    verify: "/auth/verify",
  },
  teacher: {
    root: "/teacher",
    attendance: "/teacher/attendance",
    marks: "/teacher/marks",
  },
  principal: {
    root: "/principal",
  },
  management: {
    root: "/management",
  },
} as const;

/**
 * Role home route mapping used by auth flows and guards.
 * Keep this as the single source of truth for redirects.
 */
export function roleHomeRoute(
  role: "teacher" | "principal" | "management"
): string {
  if (role === "teacher") return ROUTES.teacher.root;
  if (role === "principal") return ROUTES.principal.root;
  return ROUTES.management.root;
}
