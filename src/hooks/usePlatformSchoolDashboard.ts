import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import {
  getSchoolDashboard,
  getSchoolStaff,
  getSchoolStudents,
  getSchoolTeachers,
} from "@/api/schools.api";

const DEFAULT_LIMIT = 25;

export function usePlatformSchoolDashboard(schoolId: number | null) {
  const enabled = typeof schoolId === "number" && schoolId > 0;

  const [teachersPage, setTeachersPage] = useState(1);
  const [studentsPage, setStudentsPage] = useState(1);
  const [staffPage, setStaffPage] = useState(1);

  const dashboard = useQuery({
    queryKey: queryKeys.platformSchoolDashboard(schoolId),
    queryFn: () => getSchoolDashboard(schoolId!),
    enabled,
    retry: 1,
  });

  const teachers = useQuery({
    queryKey: [...queryKeys.platformSchoolTeachers(schoolId), teachersPage],
    queryFn: () => getSchoolTeachers(schoolId!, teachersPage, DEFAULT_LIMIT),
    enabled,
    retry: 1,
  });

  const students = useQuery({
    queryKey: [...queryKeys.platformSchoolStudents(schoolId), studentsPage],
    queryFn: () => getSchoolStudents(schoolId!, studentsPage, DEFAULT_LIMIT),
    enabled,
    retry: 1,
  });

  const staff = useQuery({
    queryKey: [...queryKeys.platformSchoolStaff(schoolId), staffPage],
    queryFn: () => getSchoolStaff(schoolId!, staffPage, DEFAULT_LIMIT),
    enabled,
    retry: 1,
  });

  return {
    dashboard,
    teachers,
    teachersPage,
    setTeachersPage,
    students,
    studentsPage,
    setStudentsPage,
    staff,
    staffPage,
    setStaffPage,
    limit: DEFAULT_LIMIT,
  };
}
