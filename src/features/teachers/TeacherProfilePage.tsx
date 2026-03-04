import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { logger } from "@/utils/logger";
import { useTeacherById } from "@/hooks/useTeacherById";
import { Mail, Phone, UserCircle2 } from "lucide-react";

export function TeacherProfilePage() {
  const trace = useMemo(() => logger.traceId(), []);
  const params = useParams();
  const teacherId = Number(params.teacherId);

  const { teacher, isLoading, error } = useTeacherById(teacherId);

  if (!Number.isFinite(teacherId) || teacherId <= 0) {
    return (
      <div className="px-4 py-6">
        <ErrorState title="Teacher not found" message="Invalid teacher ID." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <LoadingState label="Loading teacher..." />
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="px-4 py-6">
        <ErrorState
          title="Teacher not found"
          message="Unable to load teacher profile."
        />
      </div>
    );
  }

  logger.info("[teacher-profile] loaded", { trace, teacherId });

  const name = teacher.name ?? "—";
  const phone = teacher.phone ?? "—";
  const email = teacher.email ?? "—";
  const status = teacher.status
    ? teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)
    : typeof teacher.is_active === "boolean"
      ? teacher.is_active
        ? "Active"
        : "Inactive"
      : null;
  const assignmentLabels = (teacher.assignments ?? [])
    .map((item) => item.label?.trim())
    .filter((label): label is string => Boolean(label));
  const primarySection = teacher.assigned_section_label?.trim() || null;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-5">
        {/* Header card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-2xl font-extrabold tracking-tight text-gray-900">
            <UserCircle2 className="mr-2 inline h-6 w-6 text-slate-600" />
            {name}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs font-semibold text-gray-500">Phone</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">
                {phone === "—" ? (
                  phone
                ) : (
                  <a
                    href={`tel:${phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {phone}
                  </a>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs font-semibold text-gray-500">Email</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">
                {email === "—" ? (
                  email
                ) : (
                  <a
                    href={`mailto:${email}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {email}
                  </a>
                )}
              </div>
            </div>

            {status ? (
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-xs font-semibold text-gray-500">
                  Status
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {status}
                </div>
              </div>
            ) : null}

            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs font-semibold text-gray-500">
                Teacher ID
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-900">
                {teacher.id}
              </div>
            </div>
          </div>
        </div>

        {/* Primary assignment block */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-lg font-extrabold tracking-tight text-gray-900">
            Primary Attendance Section
          </div>
          {primarySection ? (
            <>
              <div className="mt-2 text-sm font-semibold text-gray-800">
                {primarySection}
              </div>
              <div className="mt-1 text-xs font-medium text-gray-500">
                Used for attendance ownership and default class context.
              </div>
            </>
          ) : (
            <div className="mt-2 text-sm font-semibold text-gray-500">
              Not assigned
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-lg font-extrabold tracking-tight text-gray-900">
            Subject Assignments
          </div>
          {assignmentLabels.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {assignmentLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-sm font-semibold text-gray-500">
              No subject assignments found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
