import { EXAM_TYPE_PRESETS } from "@/constants/examTypes";

export function normalizeExamType(raw: string): string {
  const base = String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return base.slice(0, 32);
}

export function prettyExamType(value?: string | null): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "Exam";

  const preset = EXAM_TYPE_PRESETS.find(
    (item) => item.value === normalizeExamType(raw),
  );
  if (preset) return preset.label;

  return raw
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}
