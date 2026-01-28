/**
 * Returns initials for avatars (e.g., "John Doe" -> "JD")
 */
export const getInitials = (name?: string | null) => {
  if (!name) return "??";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
