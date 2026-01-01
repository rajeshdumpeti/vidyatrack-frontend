export const ROUTE_TITLES: Record<string, string> = {
  "/teacher": "Teacher Dashboard",
  "/teacher/attendance": "Mark Attendance",
  "/teacher/marks": "Enter Marks",
  "/principal": "Principal Dashboard",
  "/management": "Management Dashboard",
};

export function getHeaderTitle(pathname: string): string {
  // Exact match first
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];

  // Fallback: match by prefix (handles nested paths safely without heavy logic)
  const byPrefix = Object.entries(ROUTE_TITLES).find(([route]) =>
    pathname.startsWith(route + "/")
  );
  return byPrefix?.[1] ?? "VidyaTrack";
}
