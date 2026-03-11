import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import {
  getSchoolDashboard,
  getSchoolStaff,
  getSchoolStudents,
  getSchoolTeachers,
} from "@/api/schools.api";

export function usePlatformSchoolDashboard(schoolId: number | null) {
  const enabled = typeof schoolId === "number" && schoolId > 0;

  const dashboard = useQuery({
    queryKey: queryKeys.platformSchoolDashboard(schoolId),
    queryFn: () => getSchoolDashboard(schoolId!),
    enabled,
    retry: 1,
  });

  const teachers = useQuery({
    queryKey: queryKeys.platformSchoolTeachers(schoolId),
    queryFn: () => getSchoolTeachers(schoolId!),
    enabled,
    retry: 1,
  });

  const students = useQuery({
    queryKey: queryKeys.platformSchoolStudents(schoolId),
    queryFn: () => getSchoolStudents(schoolId!),
    enabled,
    retry: 1,
  });

  const staff = useQuery({
    queryKey: queryKeys.platformSchoolStaff(schoolId),
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
