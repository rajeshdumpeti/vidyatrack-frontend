import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";

import { getSchoolDashboard } from "@/api/schools.api";
import { queryKeys } from "@/constants/queryKeys";
import { useDebounce } from "@/hooks/useDebounce";
import { useSchools } from "@/hooks/useSchools";

export function usePlatformSchoolsListPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { list, page, setPage, limit } = useSchools(
    debouncedSearch || undefined,
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const schools = list.data?.data ?? [];

  const schoolMetricsQueries = useQueries({
    queries: schools.map((school) => ({
      queryKey: queryKeys.platformSchoolDashboardFallback(school.id),
      queryFn: () => getSchoolDashboard(school.id),
      staleTime: 60_000,
      retry: 1,
    })),
  });

  const fallbackBySchoolId = useMemo(() => {
    const result = new Map<number, { teacher: number; student: number }>();
    schools.forEach((school, idx) => {
      const payload = schoolMetricsQueries[idx]?.data;
      if (!payload) return;
      result.set(school.id, {
        teacher: payload.teacher_count,
        student: payload.student_count,
      });
    });
    return result;
  }, [schools, schoolMetricsQueries]);

  const paginationMeta = list.data
    ? { total: list.data.total, total_pages: list.data.total_pages }
    : null;

  return {
    list,
    search,
    setSearch,
    debouncedSearch,
    filteredSchools: list.data?.data ?? [],
    fallbackBySchoolId,
    page,
    setPage,
    limit,
    paginationMeta,
  };
}
