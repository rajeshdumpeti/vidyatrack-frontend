import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  User,
  CheckCircle,
  Clock,
  LogOut,
  ArrowRightLeft,
  UserPlus,
} from "lucide-react";
import type { TeacherDto, TeacherStatus } from "@/types/teacher.types";
import {
  TEACHER_STATUS_CONFIG,
  TEACHER_NEXT_STATUSES,
} from "@/constants/teacherStatus";

const STATUS_ICONS: Record<TeacherStatus, React.ReactNode> = {
  ACTIVE: <CheckCircle className="h-3.5 w-3.5" />,
  ON_LEAVE: <Clock className="h-3.5 w-3.5" />,
  RESIGNED: <LogOut className="h-3.5 w-3.5" />,
  TRANSFERRED: <ArrowRightLeft className="h-3.5 w-3.5" />,
};

type TeacherActionMenuProps = {
  teacher: TeacherDto;
  isUpdating: boolean;
  onViewProfile: (teacher: TeacherDto) => void;
  onStatusChange: (teacherId: number, status: TeacherStatus) => void;
  onAssignSubstitute?: (teacher: TeacherDto) => void;
};

export function TeacherActionMenu({
  teacher,
  isUpdating,
  onViewProfile,
  onStatusChange,
  onAssignSubstitute,
}: TeacherActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentStatus = (teacher.status ?? "ACTIVE") as TeacherStatus;
  const availableStatuses = TEACHER_NEXT_STATUSES[currentStatus] ?? [];

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
        aria-label="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onViewProfile(teacher);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <User className="h-3.5 w-3.5 text-gray-400" />
            View Profile
          </button>

          <div className="my-1 border-t border-gray-100" />

          {/* Assign Substitute — only relevant when teacher is ON_LEAVE */}
          {currentStatus === "ON_LEAVE" && onAssignSubstitute ? (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onAssignSubstitute(teacher);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Assign Substitute
            </button>
          ) : null}

          {availableStatuses.map((status) => {
            const config = TEACHER_STATUS_CONFIG[status];
            return (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onStatusChange(teacher.id, status);
                }}
                className={[
                  "flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold",
                  config.actionClass,
                ].join(" ")}
              >
                {STATUS_ICONS[status]}
                Mark as {config.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
