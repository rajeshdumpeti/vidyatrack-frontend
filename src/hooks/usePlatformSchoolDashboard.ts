import { useQuery } from "@tanstack/react-query";
import {
  getSchoolDashboard,
  getSchoolStaff,
  getSchoolStudents,
  getSchoolTeachers,
} from "@/api/schools.api";

export function usePlatformSchoolDashboard(schoolId: number | null) {
  const enabled = typeof schoolId === "number" && schoolId > 0;

  const dashboard = useQuery({
    queryKey: ["platform-school-dashboard", schoolId],
    queryFn: () => getSchoolDashboard(schoolId!),
    enabled,
    retry: 1,
  });

  const teachers = useQuery({
    queryKey: ["platform-school-teachers", schoolId],
    queryFn: () => getSchoolTeachers(schoolId!),
    enabled,
    retry: 1,
  });

  const students = useQuery({
    queryKey: ["platform-school-students", schoolId],
    queryFn: () => getSchoolStudents(schoolId!),
    enabled,
    retry: 1,
  });

  const staff = useQuery({
    queryKey: ["platform-school-staff", schoolId],
    queryFn: () => getSchoolStaff(schoolId!),
    enabled,
    retry: 1,
  });

  return {
    dashboard,
    teachers,
    students,
    staff,
  };
}
