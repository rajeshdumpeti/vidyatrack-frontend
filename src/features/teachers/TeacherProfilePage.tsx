import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { logger } from "@/utils/logger";
import { useTeacherById } from "@/hooks/useTeacherById";

export function TeacherProfilePage() {
  const trace = useMemo(() => logger.traceId(), []);
  const params = useParams();
  const teacherId = Number(params.teacherId);

  const { teacher, isLoading, error, refetch } = useTeacherById(teacherId);

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
  const status =
    typeof teacher.is_active === "boolean"
      ? teacher.is_active
        ? "Active"
        : "Inactive"
      : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-5">
        {/* Header card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-2xl font-extrabold tracking-tight text-gray-900">
            {name}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs font-semibold text-gray-500">Phone</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">
                {phone}
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs font-semibold text-gray-500">Email</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">
                {email}
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

        {/* Primary assignment block (pilot-critical) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-lg font-extrabold tracking-tight text-gray-900">
            Primary Attendance Section
          </div>
          <div className="mt-2 text-sm font-semibold text-gray-700">
            Not available
          </div>
          <div className="mt-1 text-xs font-medium text-gray-500">
            Assignment endpoint is not confirmed in backend contracts for this
            step.
          </div>
        </div>
      </div>
    </div>
  );
}
