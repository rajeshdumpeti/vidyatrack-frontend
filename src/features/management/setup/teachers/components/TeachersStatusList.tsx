import type { TeacherDto, TeacherStatus } from "@/types/teacher.types";
import {
  TEACHER_STATUS_CONFIG,
  TEACHER_NEXT_STATUSES,
} from "@/constants/teacherStatus";

type TeachersStatusListProps = {
  teachers: TeacherDto[];
  isUpdating: boolean;
  updatingTeacherId: number | null;
  onStatusChange: (teacherId: number, status: TeacherStatus) => void;
};

export function TeachersStatusList({
  teachers,
  isUpdating,
  updatingTeacherId,
  onStatusChange,
}: TeachersStatusListProps) {
  if (teachers.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-sm font-bold text-gray-900">
        Manage Teacher Status
      </h3>
      <div className="space-y-2">
        {teachers.map((teacher) => {
          const currentStatus = (teacher.status as TeacherStatus) ?? "ACTIVE";
          const config =
            TEACHER_STATUS_CONFIG[currentStatus] ?? TEACHER_STATUS_CONFIG.ACTIVE;
          const nextOptions = TEACHER_NEXT_STATUSES[currentStatus] ?? [];
          const isPendingThis = isUpdating && updatingTeacherId === teacher.id;

          return (
            <div
              key={teacher.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {teacher.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {teacher.phone ?? teacher.email ?? teacher.public_id}
                </p>
                {teacher.assigned_section_label ? (
                  <p className="mt-0.5 text-xs font-medium text-blue-600">
                    {teacher.assigned_section_label}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={[
                    "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    config.badgeClass,
                  ].join(" ")}
                >
                  {config.label}
                </span>

                {nextOptions.length > 0 ? (
                  <select
                    aria-label={`Change status for ${teacher.name}`}
                    disabled={isPendingThis}
                    defaultValue=""
                    onChange={(e) => {
                      const val = e.target.value as TeacherStatus;
                      if (val) onStatusChange(teacher.id, val);
                      e.target.value = "";
                    }}
                    className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700 outline-none focus:border-blue-500 disabled:opacity-60"
                  >
                    <option value="" disabled>
                      {isPendingThis ? "Saving..." : "Change status"}
                    </option>
                    {nextOptions.map((s) => (
                      <option key={s} value={s}>
                        Mark as {TEACHER_STATUS_CONFIG[s].label}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
