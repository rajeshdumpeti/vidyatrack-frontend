export function isValidMark(value: string, maxMarks: number) {
  if (!value || typeof value !== "string") return true;

  const trimmed = value.trim();
  if (trimmed === "") return true;

  const numberValue = Number(trimmed);
  if (!Number.isFinite(numberValue)) return false;
  if (numberValue < 0) return false;
  if (numberValue > maxMarks) return false;

  return true;
}
