import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

import { HeaderActions } from "./header/components/HeaderActions";
import { HeaderBrand } from "./header/components/HeaderBrand";
import { formatHeaderDate } from "./header/utils/header.utils";

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const schoolId = useAuthStore((s) => s.schoolId);
  const schools = useAuthStore((s) => s.schools);
  const activeSchoolName = schools.find((s) => s.id === schoolId)?.name ?? null;

  const today = useMemo(() => formatHeaderDate(), []);

  const onLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 md:px-6">
        <HeaderBrand activeSchoolName={activeSchoolName} onMenuClick={onMenuClick} />
        <HeaderActions today={today} onLogout={onLogout} />
      </div>
    </header>
  );
}
