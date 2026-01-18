import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTeachers } from "@/api/teachers.api";
import type { TeacherDto } from "@/types/teacher.types";

function normalize(v: string) {
  return v.trim().toLowerCase();
}

function filterTeachers(list: TeacherDto[], search: string) {
  const q = normalize(search);
  if (!q) return list;

  return list.filter((t) => {
    const name = normalize(String(t.name ?? ""));
    const phone = normalize(String(t.phone ?? ""));
    const email = normalize(String(t.email ?? ""));
    const section = normalize(String(t.assigned_section_label ?? ""));
    return (
      name.includes(q) ||
      phone.includes(q) ||
      email.includes(q) ||
      section.includes(q)
    );
  });
}

export function usePrincipalTeachers(search: string) {
  const q = useQuery({
    queryKey: ["principal-teachers"],
    queryFn: getTeachers,
    retry: 1,
  });

  const filtered = useMemo(
    () => filterTeachers(q.data ?? [], search),
    [q.data, search]
  );

  return {
    data: filtered,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
