import { useQuery } from "@tanstack/react-query";
import { listTeachers } from "../api/teachers.api";

export function useTeachers() {
  const q = useQuery({
    queryKey: ["teachers"],
    queryFn: listTeachers,
    retry: 1,
  });

  return {
    data: q.data ?? [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
