import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiAcademicCap, HiBriefcase, HiUserCircle } from "react-icons/hi2";
import { selectRole } from "@/api/auth.api";
import { getAuthMe } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import type { RoleOption } from "@/types/auth.types";
import { logger } from "@/utils/logger";
import { AuthTopBar } from "./components/AuthTopBar";

const ROLE_META: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  management: {
    label: "Management",
    icon: <HiBriefcase className="h-6 w-6 text-purple-600" />,
    color: "bg-purple-50 group-hover:bg-purple-100",
  },
  principal: {
    label: "Principal",
    icon: <HiAcademicCap className="h-6 w-6 text-blue-600" />,
    color: "bg-blue-50 group-hover:bg-blue-100",
  },
  teacher: {
    label: "Teacher",
    icon: <HiUserCircle className="h-6 w-6 text-green-600" />,
    color: "bg-green-50 group-hover:bg-green-100",
  },
};

export function SelectRolePage() {
  const navigate = useNavigate();
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pendingRoles = useAuthStore((s) => s.pendingRoles);
  const setToken = useAuthStore((s) => s.setToken);
  const setSchools = useAuthStore((s) => s.setSchools);
  const setAuthMeta = useAuthStore((s) => s.setAuthMeta);
  const setPendingRoles = useAuthStore((s) => s.setPendingRoles);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // Guard: if no pending roles (e.g. page refresh), send back to login
  if (pendingRoles.length === 0) {
    navigate("/auth/login", { replace: true });
    return null;
  }

  const handleSelect = async (option: RoleOption) => {
    setIsSelecting(true);
    setError(null);
    try {
      const result = await selectRole(option.school_id, option.role);
      setToken(result.access_token);
      setPendingRoles([]);

      const me = await getAuthMe();
      setSchools(Array.isArray(me.schools) ? me.schools : []);
      setAuthMeta({ role: option.role, schoolId: option.school_id });

      const role = option.role.toLowerCase();
      if (role === "management") navigate("/management", { replace: true });
      else if (role === "principal") navigate("/principal", { replace: true });
      else if (role === "teacher") navigate("/teacher", { replace: true });
      else {
        clearAuth();
        throw new Error("unknown_role");
      }
    } catch (err) {
      logger.error("[auth][select-role] failed", { err });
      setError("Could not sign in with that role. Please try again.");
      setIsSelecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthTopBar />
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 mx-auto shadow-lg shadow-blue-600/20">
              <HiAcademicCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Select Your Role
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              You have multiple roles. Choose how you want to sign in today.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 rounded-2xl border border-red-200">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {pendingRoles.map((option) => {
              const meta = ROLE_META[option.role] ?? {
                label: option.role,
                icon: <HiUserCircle className="h-6 w-6 text-gray-500" />,
                color: "bg-gray-50 group-hover:bg-gray-100",
              };
              return (
                <button
                  key={`${option.school_id}-${option.role}`}
                  onClick={() => handleSelect(option)}
                  disabled={isSelecting}
                  className="w-full flex items-center p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-blue-500 hover:ring-4 hover:ring-blue-50 transition-all group text-left disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div
                    className={`p-3 rounded-xl mr-4 transition-colors ${meta.color}`}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {meta.label}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {option.school_name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            You can switch roles later from the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
