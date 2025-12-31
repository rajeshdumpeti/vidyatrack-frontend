import { useQuery } from "@tanstack/react-query";
import { getStudentsBySection } from "../api/students.api";
import type { StudentListItem } from "../types/student.types";

export function useStudentsBySection(sectionId?: number) {
  const query = useQuery({
    queryKey: ["students", "by-section", sectionId],
    queryFn: () => getStudentsBySection(sectionId as number),
    enabled: typeof sectionId === "number",
  });

  return {
    data: query.data as StudentListItem[] | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
