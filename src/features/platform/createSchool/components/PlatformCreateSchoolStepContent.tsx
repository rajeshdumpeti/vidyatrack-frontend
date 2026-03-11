import type { OnboardingForm, PlatformCreateSchoolStep } from "../types/platformCreateSchool.types";
import {
  PlatformCreateSchoolAcademicStep,
  PlatformCreateSchoolAdminStep,
  PlatformCreateSchoolIdentityStep,
  PlatformCreateSchoolLocationStep,
  PlatformCreateSchoolModulesStep,
  PlatformCreateSchoolReviewStep,
} from "./PlatformCreateSchoolSteps";

type PlatformCreateSchoolStepContentProps = {
  step: number;
  steps: readonly PlatformCreateSchoolStep[];
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

export function PlatformCreateSchoolStepContent({
  step,
  form,
  updateField,
  toggleArrayValue,
}: PlatformCreateSchoolStepContentProps) {
  if (step === 0) {
    return (
      <PlatformCreateSchoolIdentityStep
        form={form}
        updateField={updateField}
        toggleArrayValue={toggleArrayValue}
      />
    );
  }

  if (step === 1) {
    return (
      <PlatformCreateSchoolLocationStep
        form={form}
        updateField={updateField}
        toggleArrayValue={toggleArrayValue}
      />
    );
  }

  if (step === 2) {
    return (
      <PlatformCreateSchoolAdminStep
        form={form}
        updateField={updateField}
        toggleArrayValue={toggleArrayValue}
      />
    );
  }

  if (step === 3) {
    return (
      <PlatformCreateSchoolAcademicStep
        form={form}
        updateField={updateField}
        toggleArrayValue={toggleArrayValue}
      />
    );
  }

  if (step === 4) {
    return (
      <PlatformCreateSchoolModulesStep
        form={form}
        updateField={updateField}
        toggleArrayValue={toggleArrayValue}
      />
    );
  }

  return <PlatformCreateSchoolReviewStep form={form} />;
}
