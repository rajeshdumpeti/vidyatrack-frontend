import { create } from "zustand";

type UserRole = "management" | "principal" | "teacher";

type JwtPayload = {
  role?: unknown;
  school_id?: unknown;
  // other claims allowed but ignored
};

type AuthState = {
  accessToken: string | null;
  role: UserRole | null;
  schoolId: number | null;

  setToken: (token: string) => void;
  clearAuth: () => void;
};

const STORAGE_KEY = "vidyatrack_access_token";

function base64UrlDecode(input: string): string {
  // base64url -> base64
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  // pad
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLen);

  // decode
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

  const v = value.toLowerCase().trim();
  if (v === "management" || v === "principal" || v === "teacher")
    return v as UserRole;

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

function deriveClaims(token: string): {
  role: UserRole;
  schoolId: number | null;
} {
  const payload = parseJwtPayload(token);
  const role = coerceRole(payload.role);
  if (!role) throw new Error("invalid_role_claim");
  const schoolId = coerceSchoolId(payload.school_id);
  return { role, schoolId };
}

function loadTokenFromStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveTokenToStorage(token: string | null): void {
  try {
    if (!token) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // ignore storage errors (private browsing / locked storage)
  }
}

export const useAuthStore = create<AuthState>((set) => {
  // Hydrate on store creation
  const stored = loadTokenFromStorage();
  if (stored) {
    try {
      const { role, schoolId } = deriveClaims(stored);
      return {
        accessToken: stored,
        role,
        schoolId,
        setToken: (token: string) => {
          try {
            const claims = deriveClaims(token);
            saveTokenToStorage(token);
            set({
              accessToken: token,
              role: claims.role,
              schoolId: claims.schoolId,
            });
          } catch {
            saveTokenToStorage(null);
            set({ accessToken: null, role: null, schoolId: null });
          }
        },
        clearAuth: () => {
          saveTokenToStorage(null);
          set({ accessToken: null, role: null, schoolId: null });
        },
      };
    } catch {
      saveTokenToStorage(null);
    }
  }

  // Default empty state
  return {
    accessToken: null,
    role: null,
    schoolId: null,
    setToken: (token: string) => {
      try {
        const claims = deriveClaims(token);
        saveTokenToStorage(token);
        set({
          accessToken: token,
          role: claims.role,
          schoolId: claims.schoolId,
        });
      } catch {
        saveTokenToStorage(null);
        set({ accessToken: null, role: null, schoolId: null });
      }
    },
    clearAuth: () => {
      saveTokenToStorage(null);
      set({ accessToken: null, role: null, schoolId: null });
    },
  };
});
