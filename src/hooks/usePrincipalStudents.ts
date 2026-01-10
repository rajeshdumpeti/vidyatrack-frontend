import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { StudentDto } from "../types/student.types";
import { getStudents, getStudentsBySectionId } from "../api/students.api";

function normalize(v: string) {
  return v.trim().toLowerCase();
}

function filterStudents(list: StudentDto[], search: string) {
  const q = normalize(search);
  if (!q) return list;

  return list.filter((s) => {
    const name = normalize(s.name ?? "");
    const roll = normalize(String(s.roll_no ?? ""));
    const phone = normalize(String(s.parent_phone ?? ""));
    return name.includes(q) || roll.includes(q) || phone.includes(q);
  });
}

export function usePrincipalStudents(params: {
  sectionId?: number;
  search: string;
}) {
  const { sectionId, search } = params;

  const query = useQuery({
    queryKey: ["principal-students", { sectionId: sectionId ?? null }],
    queryFn: () =>
      sectionId ? getStudentsBySectionId(sectionId) : getStudents(),
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
