import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createSuperadminSchool,
  type SuperadminSchoolCreateResponse,
} from "@/api/superadminSchools.api";

import {
  INITIAL_PLATFORM_CREATE_SCHOOL_FORM,
  PLATFORM_CREATE_SCHOOL_DRAFT_KEY,
  PLATFORM_CREATE_SCHOOL_STEPS,
} from "../constants/platformCreateSchool.constants";
import {
  extractDigits,
  validatePlatformCreateSchoolStep,
} from "../helpers/platformCreateSchool.helpers";
import type { OnboardingForm } from "../types/platformCreateSchool.types";

export function usePlatformCreateSchool() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: createSuperadminSchool,
    onSuccess: async () => {
      await qc.invalidateQueries();
    },
  });

  // Generate a stable idempotency key for this wizard session
  const idempotencyKey = useRef<string>(crypto.randomUUID());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<SuperadminSchoolCreateResponse | null>(null);

  // Detect whether a draft was found on mount
  const [showDraftBanner, setShowDraftBanner] = useState(() => {
    return sessionStorage.getItem(PLATFORM_CREATE_SCHOOL_DRAFT_KEY) !== null;
  });

  const [form, setForm] = useState<OnboardingForm>(() => {
    const raw = sessionStorage.getItem(PLATFORM_CREATE_SCHOOL_DRAFT_KEY);
    if (!raw) return INITIAL_PLATFORM_CREATE_SCHOOL_FORM;
    try {
      const parsed = JSON.parse(raw) as OnboardingForm;
      return { ...INITIAL_PLATFORM_CREATE_SCHOOL_FORM, ...parsed };
    } catch {
      return INITIAL_PLATFORM_CREATE_SCHOOL_FORM;
    }
  });
  const [step, setStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  useEffect(() => {
    sessionStorage.setItem(
      PLATFORM_CREATE_SCHOOL_DRAFT_KEY,
      JSON.stringify(form),
    );
  }, [form]);

  const updateField = <K extends keyof OnboardingForm>(
    key: K,
    value: OnboardingForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = (
    key: "class_levels" | "modules_enabled",
    value: string,
  ) => {
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

  const progress = useMemo(
    () => Math.round((step / PLATFORM_CREATE_SCHOOL_STEPS.length) * 100),
    [step],
  );

  const resetDraft = () => {
    sessionStorage.removeItem(PLATFORM_CREATE_SCHOOL_DRAFT_KEY);
    setForm(INITIAL_PLATFORM_CREATE_SCHOOL_FORM);
    setStep(0);
    setStepErrors([]);
    setShowDraftBanner(false);
  };

  const dismissDraftBanner = () => setShowDraftBanner(false);

  const submit = async () => {
    const errors = validatePlatformCreateSchoolStep(form, step);
    setStepErrors(errors);
    if (errors.length > 0) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    const phoneDigits = extractDigits(form.admin_phone).slice(-10);
    const fullPhone = `${form.admin_phone_country}${phoneDigits}`;
    const schoolPhoneDigits = extractDigits(form.school_phone).slice(-10);
    const fullSchoolPhone = `+91${schoolPhoneDigits}`;
    const monthToKey = (name: string) => name.trim().toLowerCase();
    const latitude = form.latitude.trim() ? Number(form.latitude.trim()) : null;
    const longitude = form.longitude.trim() ? Number(form.longitude.trim()) : null;

    try {
      const result = await create.mutateAsync({
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
            [
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
            ].map((m) => [m, form.modules_enabled.includes(m)]),
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
          plan_type: "pilot",
          is_test: false,
          trial_days: 0,
          billing_start_date: null,
        },
        idempotencyKey: idempotencyKey.current,
      });

      sessionStorage.removeItem(PLATFORM_CREATE_SCHOOL_DRAFT_KEY);
      setSuccessData(result);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response
        ?.data?.detail as unknown;
      const conflictCodes = (detail as { conflicts?: unknown })?.conflicts;
      const conflicts = Array.isArray(conflictCodes) ? conflictCodes : [];

      const toMessage = (code: unknown) => {
        if (code === "SCHOOL_CODE_ALREADY_EXISTS")
          return "School code already exists. Choose a different school code.";
        if (code === "UDISE_CODE_ALREADY_EXISTS")
          return "UDISE code already exists. Check and try again.";
        if (code === "SCHOOL_EMAIL_ALREADY_EXISTS")
          return "School email already exists. Use a different school email.";
        if (code === "ADMIN_PHONE_ALREADY_EXISTS")
          return "Admin phone already exists. Use a different phone number.";
        if (code === "ADMIN_EMAIL_ALREADY_EXISTS")
          return "Admin email already exists. Use a different email.";
        return typeof code === "string" ? code : "Create school failed. Please try again.";
      };

      if (conflicts.length > 0) {
        setStepErrors(conflicts.map(toMessage));
      } else {
        setStepErrors(["Create school failed. Please try again."]);
      }

      setIsSubmitting(false);
    }
  };

  return {
    form,
    step,
    stepErrors,
    steps: PLATFORM_CREATE_SCHOOL_STEPS,
    progress,
    create,
    isSubmitting,
    successData,
    showDraftBanner,
    dismissDraftBanner,
    updateField,
    toggleArrayValue,
    goNext,
    goBack,
    resetDraft,
    submit,
    navigateBack: () => navigate(-1),
    navigateToSchools: () => navigate("/superadmin/schools"),
  };
}
