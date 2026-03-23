import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { getStudents } from "@/api/students.api";
import { useAuthStore } from "@/store/auth.store";

export function usePrincipalStudents(params: {
  sectionId?: number;
  search: string;
  page?: number;
  limit?: number;
}) {
  const { sectionId, search, page = 1, limit = 20 } = params;
  const schoolId = useAuthStore((s) => s.schoolId);

  const query = useQuery({
    queryKey: queryKeys.principalStudents(schoolId, {
      page,
      limit,
      search,
      sectionId: sectionId ?? null,
    }),
    queryFn: () =>
      getStudents(schoolId!, {
        page,
        limit,
        search: search || undefined,
        sectionId: sectionId ?? null,
      }),
    enabled: !!schoolId,
    retry: 1,
  });

  return {
    data: query.data?.data ?? [],
    totalPages: query.data?.total_pages ?? 1,
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
