export function normalizePhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function mapImportError(code: string) {
  const key = code.trim();
  const map: Record<string, string> = {
    name_or_first_last_required: "Student name is required.",
    parent_phone_required_or_invalid:
      "Guardian phone is required and must be 10 digits.",
    class_name_required: "Class is required.",
    section_name_required: "Section is required.",
    class_section_not_found:
      "Class/Section not found. Check spelling (e.g., Grade 9 / 9th) and section.",
    date_of_birth_must_be_yyyy_mm_dd: "DOB must be in YYYY-MM-DD format.",
    admission_date_must_be_yyyy_mm_dd:
      "Admission date must be in YYYY-MM-DD format.",
    gender_must_be_male_female_or_other:
      "Gender must be male, female, or other.",
    duplicate_in_file: "Duplicate row in this file.",
    already_exists: "Student already exists in this class/section.",
    section_not_found_at_commit:
      "Section not found when importing (update class/section).",
  };
  return map[key] ?? key;
}
