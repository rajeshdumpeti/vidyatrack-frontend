import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  editSuperadminSchool,
  getSuperadminSchoolDetail,
} from "@/api/superadminSchools.api";
import { InsightState } from "@/components/feedback/InsightState";

import {
  INITIAL_PLATFORM_CREATE_SCHOOL_FORM,
  MODULE_OPTIONS,
  MONTH_OPTIONS,
  PLATFORM_CREATE_SCHOOL_STEPS,
} from "./createSchool/constants/platformCreateSchool.constants";
import {
  extractDigits,
  formatPhone10,
  validatePlatformCreateSchoolStep,
} from "./createSchool/helpers/platformCreateSchool.helpers";
import type { OnboardingForm } from "./createSchool/types/platformCreateSchool.types";
import { PlatformCreateSchoolAlerts } from "./createSchool/components/PlatformCreateSchoolAlerts";
import { PlatformCreateSchoolStepContent } from "./createSchool/components/PlatformCreateSchoolStepContent";
import { PlatformCreateSchoolStepHeader } from "./createSchool/components/PlatformCreateSchoolSteps";

const ALL_MODULES = [
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

function monthNameFromInt(value: number | null) {
  if (!value) return "";
  const idx = Math.max(1, Math.min(12, value)) - 1;
  return MONTH_OPTIONS[idx] ?? "";
}

export function PlatformEditSchoolPage() {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const safeSchoolId = (schoolId || "").trim();
  const isValid = safeSchoolId.length > 10;

  const detail = useQuery({
    queryKey: ["superadmin-school-detail", safeSchoolId],
    queryFn: () => getSuperadminSchoolDetail(safeSchoolId),
    enabled: isValid,
  });

  const [step, setStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [planType, setPlanType] = useState<"pilot" | "starter" | "standard" | "premium">("pilot");
  const [isTest, setIsTest] = useState(false);
  const [form, setForm] = useState<OnboardingForm>(INITIAL_PLATFORM_CREATE_SCHOOL_FORM);

  useEffect(() => {
    const data = detail.data?.data;
    if (!data) return;

    const school = data.school;
    const contact = data.contact;
    const academic = data.academic;
    const mgmt = data.management_admin;
    const modulesMap = data.modules_limits?.modules ?? {};

    const enabledModules = Object.entries(modulesMap)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .filter((k) => MODULE_OPTIONS.includes(k));

    const schoolPhoneDigits = extractDigits(contact.school_phone || "").slice(-10);
    const adminPhoneRaw = mgmt?.phone || "";
    const adminPhoneDigits = extractDigits(adminPhoneRaw).slice(-10);
    const adminCountry = adminPhoneRaw.trim().startsWith("+1") ? "+1" : "+91";

    setPlanType((school.plan_type || "pilot") as typeof planType);
    setIsTest(Boolean(school.is_test));
    setForm({
      ...INITIAL_PLATFORM_CREATE_SCHOOL_FORM,
      school_name: school.name || "",
      school_code: school.school_code || "",
      board: (school.board as string) || "",
      category: (school.category as string) || "",
      medium: (school.medium as string) || "English",
      school_type: (school.school_type as string) || "co_educational",
      established_year: school.established_year ? String(school.established_year) : "",
      affiliation_number: school.affiliation_number || "",
      udise_code: school.udise_code || "",
      street: contact.street_address || "",
      area: contact.area || "",
      city: contact.city || "",
      district: contact.district || "",
      state: contact.state || "",
      pin_code: contact.pincode || "",
      country: contact.country || "India",
      landmark: contact.landmark || "",
      latitude: contact.latitude != null ? String(contact.latitude) : "",
      longitude: contact.longitude != null ? String(contact.longitude) : "",
      school_phone: formatPhone10(schoolPhoneDigits),
      school_email: contact.school_email || "",
      website: contact.website || "",
      admin_first_name: mgmt?.first_name || (mgmt?.full_name?.split(" ")[0] ?? ""),
      admin_last_name: mgmt?.last_name || (mgmt?.full_name?.split(" ").slice(1).join(" ") ?? ""),
      admin_designation: mgmt?.designation || "",
      admin_department: mgmt?.department || "",
      admin_employee_id: mgmt?.employee_id || "",
      admin_phone_country: adminCountry,
      admin_phone: formatPhone10(adminPhoneDigits),
      admin_email: mgmt?.email || "",
      current_session: academic.current_session || "",
      academic_start_month: monthNameFromInt(academic.academic_start_month),
      academic_end_month: monthNameFromInt(academic.academic_end_month),
      working_days_per_week: academic.working_days_per_week ? String(academic.working_days_per_week) : "6",
      class_levels: academic.class_levels || [],
      lkg_available: (academic.class_levels || []).includes("LKG"),
      ukg_available: (academic.class_levels || []).includes("UKG"),
      pre_nursery_available: (academic.class_levels || []).includes("Pre Nursery"),
      modules_enabled: enabledModules.length ? enabledModules : ["attendance", "exams"],
      max_students: String(data.modules_limits?.limits?.max_students ?? "1000"),
      max_teachers: String(data.modules_limits?.limits?.max_teachers ?? "60"),
      max_staff: String(data.modules_limits?.limits?.max_staff ?? "40"),
      storage_limit_gb: String(data.modules_limits?.limits?.storage_limit_gb ?? "100"),
      api_access: Boolean(data.modules_limits?.features?.api_access),
      bulk_operations: Boolean(data.modules_limits?.features?.bulk_operations),
      custom_reports: Boolean(data.modules_limits?.features?.custom_reports),
    });
  }, [detail.data]);

  const updateField = <K extends keyof OnboardingForm>(key: K, value: OnboardingForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = (key: "class_levels" | "modules_enabled", value: string) => {
    setForm((prev) => {
      const current = prev[key];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists ? current.filter((entry) => entry !== value) : [...current, value],
      };
    });
  };

  const edit = useMutation({
    mutationFn: async () => {
      const phoneDigits = extractDigits(form.admin_phone).slice(-10);
      const fullPhone = `${form.admin_phone_country}${phoneDigits}`;
      const schoolPhoneDigits = extractDigits(form.school_phone).slice(-10);
      const fullSchoolPhone = `+91${schoolPhoneDigits}`;
      const monthToKey = (name: string) => name.trim().toLowerCase();
      const latitude = form.latitude.trim() ? Number(form.latitude.trim()) : null;
      const longitude = form.longitude.trim() ? Number(form.longitude.trim()) : null;

      return editSuperadminSchool(safeSchoolId, {
        school_identity: {
          school_name: form.school_name.trim(),
          school_code: form.school_code.trim().toUpperCase() || null,
          board: form.board,
          category: form.category,
          medium: form.medium,
          school_type: form.school_type,
          established_year: form.established_year.trim() ? Number(form.established_year) : null,
          affiliation_number: form.affiliation_number.trim() || null,
          udise_code: form.udise_code.trim() || null,
        },
        location_contact: {
          street_address: form.street.trim(),
          area: form.area.trim() || null,
          city: form.city.trim(),
          district: form.district.trim(),
          state: form.state.trim(),
          pincode: extractDigits(form.pin_code).slice(0, 6),
          country: form.country.trim() || "India",
          landmark: form.landmark.trim() || null,
          latitude: Number.isFinite(latitude) ? latitude : null,
          longitude: Number.isFinite(longitude) ? longitude : null,
          school_phone: fullSchoolPhone,
          school_email: form.school_email.trim().toLowerCase(),
          website: form.website.trim() || null,
        },
        management_admin: {
          first_name: form.admin_first_name.trim(),
          last_name: form.admin_last_name.trim(),
          designation: form.admin_designation.trim() || null,
          department: form.admin_department.trim() || null,
          employee_id: form.admin_employee_id.trim() || null,
          phone: fullPhone,
          email: form.admin_email.trim().toLowerCase(),
          language: form.language_preference || "en",
          timezone: form.timezone || "Asia/Kolkata",
          send_credentials_via: form.send_credentials_via,
        },
        academic_baseline: {
          current_session: form.current_session.trim(),
          academic_start_month: monthToKey(form.academic_start_month) as "april" | "june" | "july",
          academic_end_month: monthToKey(form.academic_end_month) as "march" | "may",
          working_days_per_week: Number(form.working_days_per_week) as 5 | 6,
          class_levels_enabled: form.class_levels,
        },
        modules_limits: {
          modules: Object.fromEntries(
            ALL_MODULES.map((m) => [m, form.modules_enabled.includes(m)]),
          ),
          limits: {
            max_students: Number(form.max_students),
            max_teachers: Number(form.max_teachers),
            max_staff: Number(form.max_staff),
            storage_limit_gb: Number(form.storage_limit_gb),
          },
          features: {
            api_access: form.api_access,
            bulk_operations: form.bulk_operations,
            custom_reports: form.custom_reports,
          },
        },
        plan_info: {
          plan_type: planType,
          is_test: isTest,
          trial_days: 0,
          billing_start_date: null,
        },
      });
    },
    onSuccess: () => navigate(`/superadmin/schools/${safeSchoolId}`),
  });

  const progress = useMemo(
    () => Math.round((step / PLATFORM_CREATE_SCHOOL_STEPS.length) * 100),
    [step],
  );

  const goNext = () => {
    const errors = validatePlatformCreateSchoolStep(form, step);
    setStepErrors(errors);
    if (errors.length > 0) return;
    setStep((prev) => Math.min(prev + 1, PLATFORM_CREATE_SCHOOL_STEPS.length - 1));
  };

  const goBack = () => {
    setStepErrors([]);
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const submit = () => {
    const errors = validatePlatformCreateSchoolStep(form, step);
    setStepErrors(errors);
    if (errors.length > 0) return;
    edit.mutate();
  };

  const discard = () => navigate(`/superadmin/schools/${safeSchoolId}`);

  if (!isValid) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="font-semibold text-red-600">Invalid school id.</p>
      </div>
    );
  }

  if (detail.isLoading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <InsightState title="Loading school…" />
      </div>
    );
  }

  if (detail.isError || !detail.data?.data?.school) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <InsightState title="Could not load school detail" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <button
        type="button"
        onClick={() => navigate(`/superadmin/schools/${safeSchoolId}`)}
        className="mb-6 flex items-center gap-2 text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to School</span>
      </button>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit School</h1>
          <p className="mt-1 text-gray-500">Update school and management configuration.</p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-gray-700">Plan Type</span>
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5">
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value as typeof planType)}
                className="w-full bg-transparent text-sm text-gray-900 outline-none"
              >
                <option value="pilot">pilot</option>
                <option value="starter">starter</option>
                <option value="standard">standard</option>
                <option value="premium">premium</option>
              </select>
            </div>
          </label>

          <button
            type="button"
            onClick={() => setIsTest((v) => !v)}
            className={[
              "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left",
              isTest
                ? "border-yellow-300 bg-yellow-50 text-yellow-900"
                : "border-gray-200 bg-white text-gray-700",
            ].join(" ")}
          >
            <span className="text-sm font-semibold">Test School</span>
            <span
              className={[
                "inline-flex h-5 w-10 items-center rounded-full p-0.5 transition-all",
                isTest ? "bg-yellow-500" : "bg-gray-300",
              ].join(" ")}
            >
              <span
                className={[
                  "h-4 w-4 rounded-full bg-white transition-all",
                  isTest ? "translate-x-5" : "translate-x-0",
                ].join(" ")}
              />
            </span>
          </button>
        </div>

        <PlatformCreateSchoolStepHeader
          step={step}
          steps={PLATFORM_CREATE_SCHOOL_STEPS}
          progress={progress}
        />

        <PlatformCreateSchoolStepContent
          step={step}
          steps={PLATFORM_CREATE_SCHOOL_STEPS}
          form={form}
          updateField={updateField}
          toggleArrayValue={toggleArrayValue}
        />

        <PlatformCreateSchoolAlerts
          stepErrors={stepErrors}
          showCreateError={edit.isError}
        />

        <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={discard}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Discard Changes
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
            {step < PLATFORM_CREATE_SCHOOL_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={edit.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {edit.isPending ? "Saving…" : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
