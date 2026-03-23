import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSchools } from "@/hooks/useSchools";

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
  const { create } = useSchools();

  // Generate a stable idempotency key for this wizard session
  const idempotencyKey = useRef<string>(crypto.randomUUID());
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    try {
      await create.mutateAsync({
        name: form.school_name.trim(),
        admin_phone: fullPhone,
        admin_email: form.admin_email.trim() || null,
        idempotencyKey: idempotencyKey.current,
      });

      sessionStorage.removeItem(PLATFORM_CREATE_SCHOOL_DRAFT_KEY);
      navigate("/platform/schools", { replace: true, state: { success: true } });
    } catch {
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
    showDraftBanner,
    dismissDraftBanner,
    updateField,
    toggleArrayValue,
    goNext,
    goBack,
    resetDraft,
    submit,
    navigateBack: () => navigate(-1),
  };
}
