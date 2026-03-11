import { Check, School } from "lucide-react";

import {
  CLASS_LEVEL_OPTIONS,
  MODULE_OPTIONS,
  MONTH_OPTIONS,
} from "../constants/platformCreateSchool.constants";
import { PLATFORM_CREATE_SCHOOL_STEP_DESCRIPTIONS } from "../constants/platformCreateSchoolStepDescriptions";
import type { OnboardingForm, PlatformCreateSchoolStep } from "../types/platformCreateSchool.types";
import { PlatformCreateSchoolReviewCards } from "./PlatformCreateSchoolReviewCards";
import { PlatformCreateSchoolSelectionGrid } from "./PlatformCreateSchoolSelectionGrid";
import {
  CountryPhoneField,
  Field,
  PhoneField,
  SelectField,
  SwitchField,
} from "./PlatformCreateSchoolFields";

type CommonStepProps = {
  form: OnboardingForm;
  updateField: <K extends keyof OnboardingForm>(
    key: K,
    value: OnboardingForm[K],
  ) => void;
  toggleArrayValue: (
    key: "class_levels" | "modules_enabled",
    value: string,
  ) => void;
};

export function PlatformCreateSchoolIdentityStep({
  form,
  updateField,
}: CommonStepProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field
        label="School Name"
        value={form.school_name}
        onChange={(value) => updateField("school_name", value)}
        placeholder="e.g. Saint Xavier High School"
        icon={<School className="h-4 w-4 text-gray-400" />}
      />
      <Field
        label="School Code"
        value={form.school_code}
        onChange={(value) => updateField("school_code", value.toUpperCase())}
        placeholder="e.g. SXH001"
      />
      <SelectField
        label="Board"
        value={form.board}
        onChange={(value) => updateField("board", value)}
        options={["CBSE", "ICSE", "State Board", "CIE", "IB"]}
      />
      <SelectField
        label="Category"
        value={form.category}
        onChange={(value) => updateField("category", value)}
        options={["primary", "secondary", "senior_secondary", "international"]}
      />
      <SelectField
        label="Medium"
        value={form.medium}
        onChange={(value) => updateField("medium", value)}
        options={["English", "Hindi", "Regional"]}
      />
      <SelectField
        label="Type"
        value={form.school_type}
        onChange={(value) => updateField("school_type", value)}
        options={["co_educational", "boys", "girls"]}
      />
      <Field
        label="Established Year"
        value={form.established_year}
        onChange={(value) => updateField("established_year", value)}
        placeholder="e.g. 2010"
      />
      <Field
        label="Affiliation Number (Optional)"
        value={form.affiliation_number}
        onChange={(value) => updateField("affiliation_number", value)}
        placeholder="e.g. CBSE-12345-2024"
      />
      <Field
        label="UDISE Code (Optional)"
        value={form.udise_code}
        onChange={(value) => updateField("udise_code", value)}
        placeholder="e.g. 27010123456"
      />
    </div>
  );
}

export function PlatformCreateSchoolLocationStep({
  form,
  updateField,
}: CommonStepProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Street Address" value={form.street} onChange={(value) => updateField("street", value)} placeholder="123 Education Road" />
      <Field label="Area" value={form.area} onChange={(value) => updateField("area", value)} placeholder="Koramangala" />
      <Field label="City" value={form.city} onChange={(value) => updateField("city", value)} placeholder="Bangalore" />
      <Field label="District" value={form.district} onChange={(value) => updateField("district", value)} placeholder="Bangalore Urban" />
      <Field label="State" value={form.state} onChange={(value) => updateField("state", value)} placeholder="Karnataka" />
      <Field label="Pin Code" value={form.pin_code} onChange={(value) => updateField("pin_code", value)} placeholder="560034" />
      <Field label="Country" value={form.country} onChange={(value) => updateField("country", value)} placeholder="India" />
      <Field label="Landmark" value={form.landmark} onChange={(value) => updateField("landmark", value)} placeholder="Near Central Park" />
      <PhoneField label="School Phone" value={form.school_phone} onChange={(value) => updateField("school_phone", value)} />
      <Field label="School Email" value={form.school_email} onChange={(value) => updateField("school_email", value)} placeholder="contact@school.edu" />
      <Field label="Website" value={form.website} onChange={(value) => updateField("website", value)} placeholder="www.school.edu" />
    </div>
  );
}

export function PlatformCreateSchoolAdminStep({
  form,
  updateField,
}: CommonStepProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="First Name" value={form.admin_first_name} onChange={(value) => updateField("admin_first_name", value)} placeholder="John" />
      <Field label="Last Name" value={form.admin_last_name} onChange={(value) => updateField("admin_last_name", value)} placeholder="Doe" />
      <Field label="Designation" value={form.admin_designation} onChange={(value) => updateField("admin_designation", value)} placeholder="Regional Director" />
      <Field label="Department" value={form.admin_department} onChange={(value) => updateField("admin_department", value)} placeholder="Operations" />
      <Field label="Employee ID" value={form.admin_employee_id} onChange={(value) => updateField("admin_employee_id", value)} placeholder="MGT001" />
      <CountryPhoneField
        label="Management Admin Phone"
        value={form.admin_phone}
        countryCode={form.admin_phone_country}
        onCountryChange={(value) => updateField("admin_phone_country", value)}
        onChange={(value) => updateField("admin_phone", value)}
      />
      <Field label="Management Admin Email" value={form.admin_email} onChange={(value) => updateField("admin_email", value)} placeholder="management@eduorg.com" />
      <SelectField label="Language" value={form.language_preference} onChange={(value) => updateField("language_preference", value)} options={["en", "hi", "te", "ta", "kn"]} />
      <SelectField label="Timezone" value={form.timezone} onChange={(value) => updateField("timezone", value)} options={["Asia/Kolkata", "Asia/Dubai", "Europe/London"]} />
    </div>
  );
}

export function PlatformCreateSchoolAcademicStep({
  form,
  updateField,
  toggleArrayValue,
}: CommonStepProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Current Session" value={form.current_session} onChange={(value) => updateField("current_session", value)} placeholder="2025-2026" />
        <SelectField label="Academic Start Month" value={form.academic_start_month} onChange={(value) => updateField("academic_start_month", value)} options={MONTH_OPTIONS} />
        <SelectField label="Academic End Month" value={form.academic_end_month} onChange={(value) => updateField("academic_end_month", value)} options={MONTH_OPTIONS} />
        <SelectField label="Working Days Per Week" value={form.working_days_per_week} onChange={(value) => updateField("working_days_per_week", value)} options={["5", "6", "7"]} />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-gray-700">Class Levels</p>
        <PlatformCreateSchoolSelectionGrid
          options={CLASS_LEVEL_OPTIONS}
          selectedValues={form.class_levels}
          onToggle={(value) => toggleArrayValue("class_levels", value)}
          selectedClassName="border-gray-900 bg-gray-900 text-white"
          idleClassName="border-gray-200 bg-white text-gray-700 justify-center"
          columnsClassName="grid gap-2 sm:grid-cols-3 md:grid-cols-5"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <SwitchField label="LKG Available" checked={form.lkg_available} onChange={(checked) => updateField("lkg_available", checked)} />
        <SwitchField label="UKG Available" checked={form.ukg_available} onChange={(checked) => updateField("ukg_available", checked)} />
        <SwitchField label="Pre-Nursery Available" checked={form.pre_nursery_available} onChange={(checked) => updateField("pre_nursery_available", checked)} />
      </div>
    </div>
  );
}

export function PlatformCreateSchoolModulesStep({
  form,
  updateField,
  toggleArrayValue,
}: CommonStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-gray-700">Modules Enabled</p>
        <PlatformCreateSchoolSelectionGrid
          options={MODULE_OPTIONS}
          selectedValues={form.modules_enabled}
          onToggle={(value) => toggleArrayValue("modules_enabled", value)}
          selectedClassName="border-blue-700 bg-blue-50 text-blue-900"
          idleClassName="border-gray-200 bg-white text-gray-700"
          columnsClassName="grid gap-2 sm:grid-cols-2 md:grid-cols-3"
          labelTransform={(value) => value.replace("_", " ")}
          inputClassName="mr-2 h-4 w-4"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Max Students" value={form.max_students} onChange={(value) => updateField("max_students", value)} placeholder="2000" />
        <Field label="Max Teachers" value={form.max_teachers} onChange={(value) => updateField("max_teachers", value)} placeholder="100" />
        <Field label="Max Staff" value={form.max_staff} onChange={(value) => updateField("max_staff", value)} placeholder="50" />
        <Field label="Storage Limit (GB)" value={form.storage_limit_gb} onChange={(value) => updateField("storage_limit_gb", value)} placeholder="500" />
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <SwitchField label="API Access" checked={form.api_access} onChange={(checked) => updateField("api_access", checked)} />
        <SwitchField label="Bulk Operations" checked={form.bulk_operations} onChange={(checked) => updateField("bulk_operations", checked)} />
        <SwitchField label="Custom Reports" checked={form.custom_reports} onChange={(checked) => updateField("custom_reports", checked)} />
      </div>
    </div>
  );
}

export function PlatformCreateSchoolReviewStep({
  form,
}: {
  form: OnboardingForm;
}) {
  return <PlatformCreateSchoolReviewCards form={form} />;
}

export function PlatformCreateSchoolStepHeader({
  step,
  steps,
  progress,
}: {
  step: number;
  steps: readonly PlatformCreateSchoolStep[];
  progress: number;
}) {
  return (
    <>
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-500">
          <span>
            Step {step + 1} of {steps.length}
          </span>
          <span>{progress}% complete</span>
        </div>
        <div className="mb-4 h-2 rounded-full bg-gray-100">
          <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-6">
          {steps.map((label, index) => (
            <div
              key={label}
              className={[
                "flex items-center gap-2 rounded-lg border px-2 py-2 text-xs font-semibold",
                index === step
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : index < step
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white text-gray-500",
              ].join(" ")}
            >
              {index < step ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <span>{index + 1}.</span>
              )}
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <h2 className="text-base font-bold text-gray-900">{steps[step]}</h2>
        <p className="mt-1 text-sm text-gray-500">
          {PLATFORM_CREATE_SCHOOL_STEP_DESCRIPTIONS[step]}
        </p>
      </div>
    </>
  );
}
