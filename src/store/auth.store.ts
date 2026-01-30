import { create } from "zustand";

type UserRole = "management" | "principal" | "teacher" | "super_admin";

type School = {
  id: number;
  name: string;
  role: string;
};

type JwtPayload = {
  sub?: string;
  role?: unknown;
  is_super_admin?: unknown;
  exp?: number;
};

type AuthState = {
  accessToken: string | null;
  role: UserRole | null;
  schoolId: number | null; // This represents the currently "active" school
  schools: School[]; // List of schools returned from /auth/me

  setToken: (token: string) => void;
  setSchools: (schools: School[]) => void;
  setActiveSchool: (id: number) => void;
  setSchoolId: (id: number) => void;
  setAuthMeta: (meta: {
    role?: UserRole | string | null;
    schoolId?: number | string | null;
  }) => void;
  clearAuth: () => void;
};

const STORAGE_KEY = "vidyatrack_access_token";
const STORAGE_META_KEY = "vidyatrack_auth_meta";

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLen);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function parseJwtPayload(token: string): JwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("invalid_jwt_format");
  const json = base64UrlDecode(parts[1]);
  return JSON.parse(json) as JwtPayload;
}

function coerceRole(value: unknown): UserRole | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  if (v === "management" || v === "principal" || v === "teacher")
    return v as UserRole;
  if (v === "super_admin") return "super_admin";
  return null;
}

function coerceSchoolId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (
    typeof value === "string" &&
    value.trim() !== "" &&
    Number.isFinite(Number(value))
  )
    return Number(value);
  return null;
}

function deriveClaims(token: string): { role: UserRole | null } {
  const payload = parseJwtPayload(token);
  let role = coerceRole(payload.role);
  const isSuper =
    typeof payload.is_super_admin === "boolean"
      ? payload.is_super_admin
      : false;
  if (!role && isSuper) role = "super_admin";
  return { role };
}

// Helper to persist/load state
const loadToken = () => localStorage.getItem(STORAGE_KEY);
const loadActiveSchool = () => {
  const val = localStorage.getItem("active_school_id");
  return val ? Number(val) : null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: loadToken(),
  role: null, // Populated via setToken or /auth/me
  schoolId: loadActiveSchool(),
  schools: [],

  setToken: (token: string) => {
    try {
      const { role } = deriveClaims(token);
      localStorage.setItem(STORAGE_KEY, token);
      set({
        accessToken: token,
        role: role,
        // When logging in, we clear context until /auth/me or school selection happens
        schools: [],
      });
    } catch {
      get().clearAuth();
    }
  },

  setSchools: (schools: School[]) => {
    set({ schools });
    // If only one school, make it active immediately
    if (schools.length === 1) {
      get().setActiveSchool(schools[0].id);
    }
  },

  setActiveSchool: (id: number) => {
    localStorage.setItem("active_school_id", id.toString());
    set({ schoolId: id });
  },
  setSchoolId: (id: number) => {
    get().setActiveSchool(id);
  },

  setAuthMeta: (meta) => {
    const nextRole = coerceRole(meta.role);
    const nextSchoolId = coerceSchoolId(meta.schoolId);
    if (nextRole) set({ role: nextRole });
    if (nextSchoolId) get().setActiveSchool(nextSchoolId);
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_META_KEY);
    localStorage.removeItem("active_school_id");
    set({ accessToken: null, role: null, schoolId: null, schools: [] });
  },
}));
