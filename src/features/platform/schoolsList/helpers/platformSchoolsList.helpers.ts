import type { SchoolDto } from "@/types/school.types";

export function filterSchoolsBySearch(schools: SchoolDto[], search: string) {
  return schools.filter((school) =>
    school.name.toLowerCase().includes(search.toLowerCase()),
  );
}
