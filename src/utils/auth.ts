/**
 * Utility for decoding JWT and coercing types
 */

/**
 * Utility for decoding JWT and coercing types
 */
import type { NavRole } from "@/navigation/navConfig";

export const getHomeRouteForRole = (role: NavRole | string | null): string => {
  switch (role) {
    case "teacher":
      return "/teacher";
    case "principal":
      return "/principal";
    case "management":
      return "/management";
    default:
      return "/auth/login";
  }
};

export function decodeJwtPayload<T>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));
    return payload as T;
  } catch {
    return null;
  }
}

export function coerceRole(
  value: unknown,
): "management" | "principal" | "teacher" | null {
  const v = String(value || "")
    .toLowerCase()
    .trim();
  if (["management", "principal", "teacher"].includes(v)) return v as any;
  return null;
}
