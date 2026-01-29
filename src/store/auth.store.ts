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
  setAuthMeta: (meta: { role?: UserRole | string | null; schoolId?: number | string | null }) => void;
  clearAuth: () => void;
};

const STORAGE_KEY = "vidyatrack_access_token";
const STORAGE_META_KEY = "vidyatrack_auth_meta";

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
  role: UserRole | null;
  schoolId: number | null;
} {
  const payload = parseJwtPayload(token);
  const role = coerceRole(payload.role);
  if (payload.role != null && !role) throw new Error("invalid_role_claim");
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

function loadAuthMetaFromStorage(token: string): {
  role: UserRole | null;
  schoolId: number | null;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_META_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      token: string;
      role: UserRole | null;
      schoolId: number | null;
    };
    if (parsed.token !== token) return null;
    return { role: parsed.role ?? null, schoolId: parsed.schoolId ?? null };
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

function saveAuthMetaToStorage(
  token: string | null,
  meta?: { role: UserRole | null; schoolId: number | null } | null
): void {
  try {
    if (!token || !meta) localStorage.removeItem(STORAGE_META_KEY);
    else
      localStorage.setItem(
        STORAGE_META_KEY,
        JSON.stringify({ token, role: meta.role, schoolId: meta.schoolId })
      );
  } catch {
    // ignore storage errors (private browsing / locked storage)
  }
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Hydrate on store creation
  const stored = loadTokenFromStorage();
  if (stored) {
    try {
      const { role, schoolId } = deriveClaims(stored);
      const storedMeta = loadAuthMetaFromStorage(stored);
      const resolvedRole = role ?? storedMeta?.role ?? null;
      const resolvedSchoolId = schoolId ?? storedMeta?.schoolId ?? null;
      return {
        accessToken: stored,
        role: resolvedRole,
        schoolId: resolvedSchoolId,
        setToken: (token: string) => {
          try {
            const claims = deriveClaims(token);
            saveTokenToStorage(token);
            saveAuthMetaToStorage(token, {
              role: claims.role,
              schoolId: claims.schoolId,
            });
            set({
              accessToken: token,
              role: claims.role,
              schoolId: claims.schoolId,
            });
          } catch {
            saveTokenToStorage(null);
            saveAuthMetaToStorage(null);
            set({ accessToken: null, role: null, schoolId: null });
          }
        },
        setAuthMeta: (meta) => {
          const token = get().accessToken;
          if (!token) return;
          const nextRole = coerceRole(meta.role);
          const nextSchoolId = coerceSchoolId(meta.schoolId);
          saveAuthMetaToStorage(token, {
            role: nextRole,
            schoolId: nextSchoolId,
          });
          set({ role: nextRole, schoolId: nextSchoolId });
        },
        clearAuth: () => {
          saveTokenToStorage(null);
          saveAuthMetaToStorage(null);
          set({ accessToken: null, role: null, schoolId: null });
        },
      };
    } catch {
      saveTokenToStorage(null);
      saveAuthMetaToStorage(null);
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
        saveAuthMetaToStorage(token, {
          role: claims.role,
          schoolId: claims.schoolId,
        });
        set({
          accessToken: token,
          role: claims.role,
          schoolId: claims.schoolId,
        });
      } catch {
        saveTokenToStorage(null);
        saveAuthMetaToStorage(null);
        set({ accessToken: null, role: null, schoolId: null });
      }
    },
    setAuthMeta: (meta) => {
      const token = get().accessToken;
      if (!token) return;
      const nextRole = coerceRole(meta.role);
      const nextSchoolId = coerceSchoolId(meta.schoolId);
      saveAuthMetaToStorage(token, {
        role: nextRole,
        schoolId: nextSchoolId,
      });
      set({ role: nextRole, schoolId: nextSchoolId });
    },
    clearAuth: () => {
      saveTokenToStorage(null);
      saveAuthMetaToStorage(null);
      set({ accessToken: null, role: null, schoolId: null });
    },
  };
});
