import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import type { StudentDto } from "@/types/student.types";
import { getStudents, getStudentsBySectionId } from "@/api/students.api";
import { useAuthStore } from "@/store/auth.store";

function normalize(v: string) {
  return v.trim().toLowerCase();
}

function filterStudents(list: StudentDto[], search: string) {
  const q = normalize(search);
  if (!q) return list;

  return list.filter((s) => {
    const name = normalize(s.name ?? "");
    const code = normalize(String(s.student_code ?? ""));
    return name.includes(q) || code.includes(q);
  });
}

export function usePrincipalStudents(params: {
  sectionId?: number;
  search: string;
}) {
  const { sectionId, search } = params;
  const schoolId = useAuthStore((s) => s.schoolId);

  const query = useQuery({
    queryKey: queryKeys.principalStudents(sectionId, schoolId),
    queryFn: () =>
      sectionId
        ? getStudentsBySectionId(sectionId, schoolId!)
        : getStudents(schoolId!),
    enabled: !!schoolId,
    retry: 1,
  });

  const filtered = useMemo(
    () => filterStudents(query.data ?? [], search),
    [query.data, search]
  );

  return {
    data: filtered,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
