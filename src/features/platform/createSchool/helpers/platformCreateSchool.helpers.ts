import type { OnboardingForm } from "../types/platformCreateSchool.types";

export function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function extractDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhone10(input: string) {
  const digits = extractDigits(input).slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function validatePlatformCreateSchoolStep(
  form: OnboardingForm,
  index: number,
) {
  const errors: string[] = [];

  if (index === 0) {
    if (form.school_name.trim().length < 3) {
      errors.push("School name must be at least 3 characters.");
    }
    if (!form.board.trim()) errors.push("Please select a board.");
    if (!form.category.trim()) errors.push("Please select a category.");
    if (!form.medium.trim()) errors.push("Please select medium.");
  }

  if (index === 1) {
    if (!form.city.trim()) errors.push("City is required.");
    if (!form.state.trim()) errors.push("State is required.");
    if (!/^\d{6}$/.test(extractDigits(form.pin_code))) {
      errors.push("Pin code must be 6 digits.");
    }
    if (extractDigits(form.school_phone).length !== 10) {
      errors.push("School phone must be 10 digits.");
    }
    if (!validateEmail(form.school_email)) {
      errors.push("School email format is invalid.");
    }
  }

  if (index === 2) {
    if (!form.admin_first_name.trim()) {
      errors.push("Admin first name is required.");
    }
    if (!form.admin_last_name.trim()) {
      errors.push("Admin last name is required.");
    }
    if (extractDigits(form.admin_phone).length < 10) {
      errors.push("Admin phone must be at least 10 digits.");
    }
    if (!validateEmail(form.admin_email)) {
      errors.push("Admin email format is invalid.");
    }
  }

  if (index === 3) {
    if (!form.current_session.trim()) {
      errors.push("Current academic session is required.");
    }
    if (!form.academic_start_month.trim()) {
      errors.push("Academic start month is required.");
    }
    if (!form.academic_end_month.trim()) {
      errors.push("Academic end month is required.");
    }
    if (!["5", "6"].includes(form.working_days_per_week)) {
      errors.push("Working days per week must be 5 or 6.");
    }
    if (form.class_levels.length === 0) {
      errors.push("Select at least one class level.");
    }
  }

  if (index === 4) {
    if (form.modules_enabled.length === 0) {
      errors.push("Enable at least one module.");
    }
    if (Number(form.max_students) < 1) {
      errors.push("Max students must be greater than 0.");
    }
    if (Number(form.max_teachers) < 1) {
      errors.push("Max teachers must be greater than 0.");
    }
    if (Number(form.max_staff) < 1) {
      errors.push("Max staff must be greater than 0.");
    }
    if (Number(form.storage_limit_gb) < 1) {
      errors.push("Storage limit must be greater than 0.");
    }
  }

  return errors;
}
