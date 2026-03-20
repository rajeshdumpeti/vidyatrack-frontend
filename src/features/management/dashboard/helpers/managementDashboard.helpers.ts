type SchoolOption = {
  id: number;
  name: string;
  role: string;
};

export function slugifySchoolName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveSchoolByCode(
  schools: SchoolOption[],
  schoolCode: string | null,
): SchoolOption | null {
  if (!schoolCode) return null;
  const raw = schoolCode.trim().toLowerCase();
  if (!raw) return null;

  const byId = Number(raw);
  if (Number.isFinite(byId) && byId > 0) {
    const matchedById = schools.find((school) => school.id === byId);
    if (matchedById) return matchedById;
  }

  const matchedBySlug = schools.find(
    (school) => slugifySchoolName(school.name) === raw,
  );
  if (matchedBySlug) return matchedBySlug;

  const matchedByName = schools.find(
    (school) => school.name.trim().toLowerCase() === raw,
  );
  if (matchedByName) return matchedByName;

  return null;
}
