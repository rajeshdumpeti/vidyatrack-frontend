import type {
  PlatformSchoolDashboardMetrics,
  PlatformSchoolDetailTabKey,
  PlatformSchoolPersonRow,
} from "../types/platformSchoolDetail.types";

import { PLATFORM_SCHOOL_DETAIL_TABS } from "../constants/platformSchoolDetail.constants";

export function toPlatformSchoolDetailTab(
  value: string | null,
): PlatformSchoolDetailTabKey {
  if (
    value &&
    PLATFORM_SCHOOL_DETAIL_TABS.includes(value as PlatformSchoolDetailTabKey)
  ) {
    return value as PlatformSchoolDetailTabKey;
  }
  return "overview";
}

export function getMockMetrics(
  schoolId: number,
): PlatformSchoolDashboardMetrics {
  const teachers = 48 + (schoolId % 7) * 3;
  const students = 680 + (schoolId % 6) * 45;
  const staff = 26 + (schoolId % 5) * 2;
  return {
    teachers,
    students,
    staff,
    total: teachers + students + staff,
  };
}

export function getMockRows(
  kind: "teachers" | "students" | "staff",
  schoolId: number,
): PlatformSchoolPersonRow[] {
  if (kind === "teachers") {
    return Array.from({ length: 12 }, (_, index) => ({
      id: index + 1,
      name: `Teacher ${index + 1}`,
      role: "Teacher",
      email: `teacher${schoolId}${index + 1}@vidyatrack.school`,
      phone: `+91 90000${(1000 + schoolId * 7 + index).toString().slice(-5)}`,
      status: index % 5 === 0 ? "inactive" : "active",
      extra: index % 2 === 0 ? "Maths • Grade 8" : "Science • Grade 9",
    }));
  }

  if (kind === "students") {
    return Array.from({ length: 14 }, (_, index) => ({
      id: index + 1,
      name: `Student ${index + 1}`,
      role: "Student",
      email: `student${schoolId}${index + 1}@vidyatrack.school`,
      phone: `+91 80000${(1000 + schoolId * 11 + index).toString().slice(-5)}`,
      status: "active",
      extra: index % 3 === 0 ? "Class 10 • Section A" : "Class 9 • Section B",
    }));
  }

  return Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    name: `Staff ${index + 1}`,
    role: index % 2 === 0 ? "Management" : "Support Staff",
    email: `staff${schoolId}${index + 1}@vidyatrack.school`,
    phone: `+91 70000${(1000 + schoolId * 13 + index).toString().slice(-5)}`,
    status: index % 6 === 0 ? "inactive" : "active",
    extra: index % 2 === 0 ? "Administration" : "Operations",
  }));
}

export function filterPlatformSchoolRows(
  rows: PlatformSchoolPersonRow[],
  search: string,
) {
  const text = search.trim().toLowerCase();
  if (!text) return rows;

  return rows.filter(
    (row) =>
      row.name.toLowerCase().includes(text) ||
      row.email.toLowerCase().includes(text) ||
      row.phone.toLowerCase().includes(text),
  );
}
