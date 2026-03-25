export function requireSchoolId(
  schoolId: number | null | undefined,
  message = "Missing school context. Please log in again.",
) {
  if (!schoolId) {
    throw new Error(message);
  }

  return schoolId;
}
