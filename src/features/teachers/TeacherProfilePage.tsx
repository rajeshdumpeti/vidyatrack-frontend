import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { logger } from "@/utils/logger";
import { useTeacherById } from "@/hooks/useTeacherById";
import { Mail, Phone } from "lucide-react";

export function TeacherProfilePage() {
  const trace = useMemo(() => logger.traceId(), []);
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
  const publicId = teacher.public_id ?? teacher.employee_id ?? "—";
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

  useEffect(() => {
    if (!teacher?.name) return;
    navigate(location.pathname, {
      replace: true,
      state: { breadcrumbLabel: teacher.name },
    });
  }, [teacher?.name, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-extrabold text-blue-700">
                {name?.[0] ?? "T"}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-2xl font-extrabold text-gray-900">
                    {name}
                  </div>
                  {status ? (
                    <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      {status}
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Teacher ID:{" "}
                  <span className="font-semibold text-gray-900">
                    {publicId}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:w-auto md:min-w-[320px]">
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
