import { extractDigits } from "../helpers/platformCreateSchool.helpers";
import type { OnboardingForm } from "../types/platformCreateSchool.types";

export function PlatformCreateSchoolReviewCards({
  form,
}: {
  form: OnboardingForm;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-900">Identity</p>
        <p className="mt-1 text-sm text-gray-600">
          {form.school_name} ({form.school_code}) • {form.board} • {form.category}
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-900">Location & Contact</p>
        <p className="mt-1 text-sm text-gray-600">
          {form.city}, {form.state}, {form.country} • {form.school_email} • +91{" "}
          {extractDigits(form.school_phone).slice(-10)}
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-900">Management Admin</p>
        <p className="mt-1 text-sm text-gray-600">
          {form.admin_first_name} {form.admin_last_name} • {form.admin_designation} •{" "}
          {form.admin_email} • {form.admin_phone_country}{" "}
          {extractDigits(form.admin_phone).slice(-10)}
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-900">Academic & Modules</p>
        <p className="mt-1 text-sm text-gray-600">
          Session {form.current_session} • {form.class_levels.length} class levels •{" "}
          {form.modules_enabled.length} modules enabled
        </p>
      </div>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        Phase 1 submit will create the school and management admin login entry.
        Advanced details can be completed in the next setup phase.
      </div>
    </div>
  );
}
