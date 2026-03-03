import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useSchools } from "@/hooks/useSchools";
import {
  ArrowLeft,
  Check,
  School,
  ShieldCheck,
} from "lucide-react";
import { LoadingButton } from "@/components/ui/Button";

type OnboardingForm = {
  school_name: string;
  school_code: string;
  board: string;
  category: string;
  medium: string;
  school_type: string;
  established_year: string;
  affiliation_number: string;
  udise_code: string;
  street: string;
  area: string;
  city: string;
  district: string;
  state: string;
  pin_code: string;
  country: string;
  landmark: string;
  school_phone: string;
  school_email: string;
  website: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_designation: string;
  admin_department: string;
  admin_employee_id: string;
  admin_phone: string;
  admin_email: string;
  language_preference: string;
  timezone: string;
  current_session: string;
  academic_start_month: string;
  academic_end_month: string;
  working_days_per_week: string;
  class_levels: string[];
  lkg_available: boolean;
  ukg_available: boolean;
  pre_nursery_available: boolean;
  modules_enabled: string[];
  max_students: string;
  max_teachers: string;
  max_staff: string;
  storage_limit_gb: string;
  api_access: boolean;
  bulk_operations: boolean;
  custom_reports: boolean;
};

export function PlatformCreateSchoolPage() {
  const navigate = useNavigate();
  const { create } = useSchools();
  const draftKey = "platform_school_onboarding_phase1_draft";

  const initialForm = useMemo<OnboardingForm>(
    () => ({
      school_name: "",
      school_code: "",
      board: "",
      category: "",
      medium: "English",
      school_type: "co_educational",
      established_year: "",
      affiliation_number: "",
      udise_code: "",
      street: "",
      area: "",
      city: "",
      district: "",
      state: "",
      pin_code: "",
      country: "India",
      landmark: "",
      school_phone: "",
      school_email: "",
      website: "",
      admin_first_name: "",
      admin_last_name: "",
      admin_designation: "",
      admin_department: "",
      admin_employee_id: "",
      admin_phone: "",
      admin_email: "",
      language_preference: "en",
      timezone: "Asia/Kolkata",
      current_session: "",
      academic_start_month: "April",
      academic_end_month: "March",
      working_days_per_week: "6",
      class_levels: ["1", "2", "3", "4", "5"],
      lkg_available: false,
      ukg_available: false,
      pre_nursery_available: false,
      modules_enabled: ["attendance", "exams", "communication", "reports"],
      max_students: "1000",
      max_teachers: "60",
      max_staff: "40",
      storage_limit_gb: "100",
      api_access: false,
      bulk_operations: true,
      custom_reports: false,
    }),
    [],
  );

  const [form, setForm] = useState<OnboardingForm>(initialForm);
  const [step, setStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  const steps = [
    "School Identity",
    "Location & Contact",
    "Management Admin",
    "Academic Baseline",
    "Modules & Limits",
    "Review & Confirm",
  ] as const;

  useEffect(() => {
    const raw = localStorage.getItem(draftKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as OnboardingForm;
      setForm((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore corrupt draft
    }
  }, [draftKey]);

  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify(form));
  }, [draftKey, form]);

  const updateField = <K extends keyof OnboardingForm>(
    key: K,
    value: OnboardingForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = (key: "class_levels" | "modules_enabled", value: string) => {
    setForm((prev) => {
      const current = prev[key];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists
          ? current.filter((entry) => entry !== value)
          : [...current, value],
      };
    });
  };

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const extractDigits = (value: string) => value.replace(/\D/g, "");

  const validateStep = (index: number): string[] => {
    const errors: string[] = [];
    if (index === 0) {
      if (form.school_name.trim().length < 3)
        errors.push("School name must be at least 3 characters.");
      if (form.school_code.trim().length < 3)
        errors.push("School code is required.");
      if (!form.board.trim()) errors.push("Please select a board.");
      if (!form.category.trim()) errors.push("Please select a category.");
      if (!form.medium.trim()) errors.push("Please select medium.");
    }
    if (index === 1) {
      if (!form.city.trim()) errors.push("City is required.");
      if (!form.state.trim()) errors.push("State is required.");
      if (!/^\d{6}$/.test(extractDigits(form.pin_code)))
        errors.push("Pin code must be 6 digits.");
      if (extractDigits(form.school_phone).length < 10)
        errors.push("School phone must be at least 10 digits.");
      if (!validateEmail(form.school_email))
        errors.push("School email format is invalid.");
    }
    if (index === 2) {
      if (!form.admin_first_name.trim()) errors.push("Admin first name is required.");
      if (!form.admin_last_name.trim()) errors.push("Admin last name is required.");
      if (extractDigits(form.admin_phone).length < 10)
        errors.push("Admin phone must be at least 10 digits.");
      if (!validateEmail(form.admin_email))
        errors.push("Admin email format is invalid.");
    }
    if (index === 3) {
      if (!form.current_session.trim())
        errors.push("Current academic session is required.");
      if (!form.academic_start_month.trim())
        errors.push("Academic start month is required.");
      if (!form.academic_end_month.trim())
        errors.push("Academic end month is required.");
      if (!["5", "6", "7"].includes(form.working_days_per_week))
        errors.push("Working days per week must be 5, 6, or 7.");
      if (form.class_levels.length === 0)
        errors.push("Select at least one class level.");
    }
    if (index === 4) {
      if (form.modules_enabled.length === 0)
        errors.push("Enable at least one module.");
      if (Number(form.max_students) < 1)
        errors.push("Max students must be greater than 0.");
      if (Number(form.max_teachers) < 1)
        errors.push("Max teachers must be greater than 0.");
      if (Number(form.max_staff) < 1)
        errors.push("Max staff must be greater than 0.");
      if (Number(form.storage_limit_gb) < 1)
        errors.push("Storage limit must be greater than 0.");
    }
    return errors;
  };

  const goNext = () => {
    const errors = validateStep(step);
    setStepErrors(errors);
    if (errors.length > 0) return;
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => {
    setStepErrors([]);
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const progress = Math.round(((step + 1) / steps.length) * 100);

  const submit = async () => {
    const errors = validateStep(step);
    setStepErrors(errors);
    if (errors.length > 0) return;

    const phoneDigits = extractDigits(form.admin_phone).slice(-10);
    const fullPhone = `+91${phoneDigits}`;

    await create.mutateAsync({
      name: form.school_name.trim(),
      admin_phone: fullPhone,
    });

    localStorage.removeItem(draftKey);
    navigate("/platform/schools", { replace: true, state: { success: true } });
  };

  const renderIdentityStep = () => (
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

  const renderLocationStep = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <Field
        label="Street Address"
        value={form.street}
        onChange={(value) => updateField("street", value)}
        placeholder="123 Education Road"
      />
      <Field
        label="Area"
        value={form.area}
        onChange={(value) => updateField("area", value)}
        placeholder="Koramangala"
      />
      <Field
        label="City"
        value={form.city}
        onChange={(value) => updateField("city", value)}
        placeholder="Bangalore"
      />
      <Field
        label="District"
        value={form.district}
        onChange={(value) => updateField("district", value)}
        placeholder="Bangalore Urban"
      />
      <Field
        label="State"
        value={form.state}
        onChange={(value) => updateField("state", value)}
        placeholder="Karnataka"
      />
      <Field
        label="Pin Code"
        value={form.pin_code}
        onChange={(value) => updateField("pin_code", value)}
        placeholder="560034"
      />
      <Field
        label="Country"
        value={form.country}
        onChange={(value) => updateField("country", value)}
        placeholder="India"
      />
      <Field
        label="Landmark"
        value={form.landmark}
        onChange={(value) => updateField("landmark", value)}
        placeholder="Near Central Park"
      />
      <PhoneField
        label="School Phone"
        value={form.school_phone}
        onChange={(value) => updateField("school_phone", value)}
      />
      <Field
        label="School Email"
        value={form.school_email}
        onChange={(value) => updateField("school_email", value)}
        placeholder="contact@school.edu"
      />
      <Field
        label="Website"
        value={form.website}
        onChange={(value) => updateField("website", value)}
        placeholder="www.school.edu"
      />
    </div>
  );

  const renderAdminStep = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <Field
        label="First Name"
        value={form.admin_first_name}
        onChange={(value) => updateField("admin_first_name", value)}
        placeholder="John"
      />
      <Field
        label="Last Name"
        value={form.admin_last_name}
        onChange={(value) => updateField("admin_last_name", value)}
        placeholder="Doe"
      />
      <Field
        label="Designation"
        value={form.admin_designation}
        onChange={(value) => updateField("admin_designation", value)}
        placeholder="Regional Director"
      />
      <Field
        label="Department"
        value={form.admin_department}
        onChange={(value) => updateField("admin_department", value)}
        placeholder="Operations"
      />
      <Field
        label="Employee ID"
        value={form.admin_employee_id}
        onChange={(value) => updateField("admin_employee_id", value)}
        placeholder="MGT001"
      />
      <PhoneField
        label="Management Admin Phone"
        value={form.admin_phone}
        onChange={(value) => updateField("admin_phone", value)}
      />
      <Field
        label="Management Admin Email"
        value={form.admin_email}
        onChange={(value) => updateField("admin_email", value)}
        placeholder="management@eduorg.com"
      />
      <SelectField
        label="Language"
        value={form.language_preference}
        onChange={(value) => updateField("language_preference", value)}
        options={["en", "hi", "te", "ta", "kn"]}
      />
      <SelectField
        label="Timezone"
        value={form.timezone}
        onChange={(value) => updateField("timezone", value)}
        options={["Asia/Kolkata", "Asia/Dubai", "Europe/London"]}
      />
    </div>
  );

  const classLevelOptions = [
    "Pre Nursery",
    "LKG",
    "UKG",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];

  const renderAcademicStep = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Current Session"
          value={form.current_session}
          onChange={(value) => updateField("current_session", value)}
          placeholder="2025-2026"
        />
        <SelectField
          label="Academic Start Month"
          value={form.academic_start_month}
          onChange={(value) => updateField("academic_start_month", value)}
          options={[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ]}
        />
        <SelectField
          label="Academic End Month"
          value={form.academic_end_month}
          onChange={(value) => updateField("academic_end_month", value)}
          options={[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ]}
        />
        <SelectField
          label="Working Days Per Week"
          value={form.working_days_per_week}
          onChange={(value) => updateField("working_days_per_week", value)}
          options={["5", "6", "7"]}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-gray-700">Class Levels</p>
        <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-5">
          {classLevelOptions.map((level) => (
            <label
              key={level}
              className={[
                "flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold",
                form.class_levels.includes(level)
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-700",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={form.class_levels.includes(level)}
                onChange={() => toggleArrayValue("class_levels", level)}
                className="sr-only"
              />
              {level}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <SwitchField
          label="LKG Available"
          checked={form.lkg_available}
          onChange={(checked) => updateField("lkg_available", checked)}
        />
        <SwitchField
          label="UKG Available"
          checked={form.ukg_available}
          onChange={(checked) => updateField("ukg_available", checked)}
        />
        <SwitchField
          label="Pre-Nursery Available"
          checked={form.pre_nursery_available}
          onChange={(checked) => updateField("pre_nursery_available", checked)}
        />
      </div>
    </div>
  );

  const moduleOptions = [
    "attendance",
    "exams",
    "fees",
    "library",
    "transport",
    "hostel",
    "hr",
    "accounting",
    "communication",
    "reports",
  ];

  const renderModulesStep = () => (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-gray-700">Modules Enabled</p>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {moduleOptions.map((module) => (
            <label
              key={module}
              className={[
                "flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm font-semibold capitalize",
                form.modules_enabled.includes(module)
                  ? "border-blue-700 bg-blue-50 text-blue-900"
                  : "border-gray-200 bg-white text-gray-700",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={form.modules_enabled.includes(module)}
                onChange={() => toggleArrayValue("modules_enabled", module)}
                className="mr-2 h-4 w-4"
              />
              {module.replace("_", " ")}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Max Students"
          value={form.max_students}
          onChange={(value) => updateField("max_students", value)}
          placeholder="2000"
        />
        <Field
          label="Max Teachers"
          value={form.max_teachers}
          onChange={(value) => updateField("max_teachers", value)}
          placeholder="100"
        />
        <Field
          label="Max Staff"
          value={form.max_staff}
          onChange={(value) => updateField("max_staff", value)}
          placeholder="50"
        />
        <Field
          label="Storage Limit (GB)"
          value={form.storage_limit_gb}
          onChange={(value) => updateField("storage_limit_gb", value)}
          placeholder="500"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <SwitchField
          label="API Access"
          checked={form.api_access}
          onChange={(checked) => updateField("api_access", checked)}
        />
        <SwitchField
          label="Bulk Operations"
          checked={form.bulk_operations}
          onChange={(checked) => updateField("bulk_operations", checked)}
        />
        <SwitchField
          label="Custom Reports"
          checked={form.custom_reports}
          onChange={(checked) => updateField("custom_reports", checked)}
        />
      </div>
    </div>
  );

  const renderReviewStep = () => (
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
          {form.admin_email} • +91 {extractDigits(form.admin_phone).slice(-10)}
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

  const renderStepContent = () => {
    if (step === 0) return renderIdentityStep();
    if (step === 1) return renderLocationStep();
    if (step === 2) return renderAdminStep();
    if (step === 3) return renderAcademicStep();
    if (step === 4) return renderModulesStep();
    return renderReviewStep();
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Schools</span>
      </button>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Register New School</h1>
          <p className="mt-1 text-gray-500">
            Phase 1 onboarding wizard for school and management setup.
          </p>
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>
              Step {step + 1} of {steps.length}
            </span>
            <span>{progress}% complete</span>
          </div>
          <div className="mb-4 h-2 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-6">
            {steps.map((label, idx) => (
              <div
                key={label}
                className={[
                  "flex items-center gap-2 rounded-lg border px-2 py-2 text-xs font-semibold",
                  idx === step
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : idx < step
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 bg-white text-gray-500",
                ].join(" ")}
              >
                {idx < step ? <Check className="h-3.5 w-3.5" /> : <span>{idx + 1}.</span>}
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <h2 className="text-base font-bold text-gray-900">{steps[step]}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {step === 0 && "Define core school identity and affiliation context."}
            {step === 1 && "Capture official contact channels and school location."}
            {step === 2 && "Create management admin profile and login identifiers."}
            {step === 3 && "Set session structure and class baseline for onboarding."}
            {step === 4 && "Enable operational modules and configure initial limits."}
            {step === 5 && "Review all details before creating school and admin account."}
          </p>
        </div>

        {renderStepContent()}

        {stepErrors.length > 0 && (
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="mb-2 text-sm font-semibold text-red-700">
              Please fix the following:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-red-600">
              {stepErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        {create.isError && (
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-600">
              Failed to create school. Admin phone might already be registered.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(draftKey);
              setForm(initialForm);
              setStep(0);
              setStepErrors([]);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Reset Draft
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                Continue
              </button>
            ) : (
              <LoadingButton
                type="button"
                onClick={submit}
                isLoading={create.isPending}
                loadingText="Creating School..."
                leftIcon={<ShieldCheck className="h-4 w-4" />}
                className="py-2.5 text-sm font-bold"
              >
                Confirm & Onboard School
              </LoadingButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5 focus-within:border-blue-500">
        {icon ? <span className="mr-2">{icon}</span> : null}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>
    </label>
  );
}

function PhoneField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5">
        <span className="text-sm font-semibold text-gray-700">+91</span>
        <span className="mx-2 h-5 w-px bg-gray-200" />
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="98765 43210"
          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label>
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-900 outline-none"
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function SwitchField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left",
        checked
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border-gray-200 bg-white text-gray-700",
      ].join(" ")}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span
        className={[
          "inline-flex h-5 w-10 items-center rounded-full p-0.5 transition-all",
          checked ? "bg-emerald-500" : "bg-gray-300",
        ].join(" ")}
      >
        <span
          className={[
            "h-4 w-4 rounded-full bg-white transition-all",
            checked ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </span>
    </button>
  );
}
