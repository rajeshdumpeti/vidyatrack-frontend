import { TEACHER_STATUS_CONFIG } from "@/constants/teacherStatus";
import type { TeacherDto, TeacherStatus } from "@/types/teacher.types";

import { normalizeAssignmentLabel } from "../helpers/teachersList.helpers";
import { TeacherActionMenu } from "./TeacherActionMenu";

type TeachersListTableProps = {
  teachers: TeacherDto[];
  expandedAssignments: Record<number, boolean>;
  updatingTeacherId: number | null;
  toggleAssignments: (teacherId: number) => void;
  onOpenTeacher: (teacher: TeacherDto) => void;
  onStatusChange: (teacherId: number, status: TeacherStatus) => void;
  onAssignSubstitute?: (teacher: TeacherDto) => void;
};

export function TeachersListTable({
  teachers,
  expandedAssignments,
  updatingTeacherId,
  toggleAssignments,
  onOpenTeacher,
  onStatusChange,
  onAssignSubstitute,
}: TeachersListTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="text-sm font-semibold text-gray-900">Results</div>
        <div className="mt-1 text-xs font-medium text-gray-500">
          Showing {teachers.length} Teachers
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-200 text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Teacher</th>
              <th className="px-4 py-3">Employee ID</th>
              <th className="px-4 py-3">Contact Info</th>
              <th className="px-4 py-3">Assigned Classes</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teachers.map((teacher) => {
              const name = teacher.name ?? `Teacher #${teacher.id}`;
              const phone = teacher.phone ?? "—";
              const email = teacher.email ?? "—";
              const employeeId = teacher.public_id ?? teacher.employee_id ?? "—";
              const assignments = teacher.assignments ?? [];
              const primaryLabel = teacher.assigned_section_label?.trim() || "";
              const primaryMatches =
                primaryLabel &&
                assignments.some((assignment) =>
                  normalizeAssignmentLabel(assignment.label ?? "").includes(
                    normalizeAssignmentLabel(primaryLabel),
                  ),
                );
              const isExpanded = !!expandedAssignments[teacher.id];
              const visibleAssignments = isExpanded
                ? assignments
                : assignments.slice(0, 2);
              const extraCount = Math.max(assignments.length - 2, 0);

              const currentStatus = (teacher.status ?? "ACTIVE") as TeacherStatus;
              const statusConfig =
                TEACHER_STATUS_CONFIG[currentStatus] ?? TEACHER_STATUS_CONFIG.ACTIVE;

              const isThisUpdating = updatingTeacherId === teacher.id;

              return (
                <tr
                  key={teacher.id}
                  className={[
                    "align-top transition-colors",
                    isThisUpdating ? "opacity-60" : "",
                  ].join(" ")}
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onOpenTeacher(teacher)}
                      className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                    >
                      {name}
                    </button>
                    {primaryLabel && (primaryMatches || assignments.length === 0) ? (
                      <div className="mt-1 text-xs text-gray-500">
                        Primary: {primaryLabel}
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-gray-400">
                        Primary: Not assigned
                      </div>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-gray-700">
                    {employeeId}
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-600">
                    <div>
                      {email === "—" ? (
                        email
                      ) : (
                        <a
                          href={`mailto:${email}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-blue-700 hover:underline"
                        >
                          {email}
                        </a>
                      )}
                    </div>
                    <div className="mt-1">
                      {phone === "—" ? (
                        phone
                      ) : (
                        <a
                          href={`tel:${phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-blue-700 hover:underline"
                        >
                          {phone}
                        </a>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {visibleAssignments.map((assignment) => (
                        <span
                          key={`${teacher.id}-${assignment.label}`}
                          className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
                        >
                          {assignment.label}
                        </span>
                      ))}
                      {!isExpanded && extraCount > 0 ? (
                        <button
                          type="button"
                          className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                          onClick={() => toggleAssignments(teacher.id)}
                        >
                          +{extraCount} more
                        </button>
                      ) : null}
                      {isExpanded && assignments.length > 2 ? (
                        <button
                          type="button"
                          className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          onClick={() => toggleAssignments(teacher.id)}
                        >
                          Show less
                        </button>
                      ) : null}
                      {assignments.length === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                        statusConfig.badgeClass,
                      ].join(" ")}
                    >
                      {statusConfig.label}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <TeacherActionMenu
                      teacher={teacher}
                      isUpdating={isThisUpdating}
                      onViewProfile={onOpenTeacher}
                      onStatusChange={onStatusChange}
                      onAssignSubstitute={onAssignSubstitute}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
