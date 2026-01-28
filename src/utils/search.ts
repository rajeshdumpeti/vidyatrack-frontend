export function normalize(s: string) {
  return s.trim().toLowerCase();
}

export function matchesSearch(
  t: { name?: string | null; phone?: string | null; email?: string | null },
  q: string,
) {
  const hay = [t.name ?? "", t.phone ?? "", t.email ?? ""]
    .map(normalize)
    .join(" ");
  return hay.includes(q);
}
