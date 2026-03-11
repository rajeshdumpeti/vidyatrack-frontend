import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";

import { getSchoolDashboard } from "@/api/schools.api";
import { queryKeys } from "@/constants/queryKeys";
import { useSchools } from "@/hooks/useSchools";

import { filterSchoolsBySearch } from "../helpers/platformSchoolsList.helpers";

export function usePlatformSchoolsListPage() {
  const { list } = useSchools();
  const [search, setSearch] = useState("");

  const schoolMetricsQueries = useQueries({
    queries: (list.data ?? []).map((school) => ({
      queryKey: queryKeys.platformSchoolDashboardFallback(school.id),
      queryFn: () => getSchoolDashboard(school.id),
      staleTime: 60_000,
      retry: 1,
    })),
  });

  const fallbackBySchoolId = useMemo(() => {
    const result = new Map<number, { teacher: number; student: number }>();
    (list.data ?? []).forEach((school, idx) => {
      const payload = schoolMetricsQueries[idx]?.data;
      if (!payload) return;
      result.set(school.id, {
        teacher: payload.teacher_count,
        student: payload.student_count,
      });
    });
    return result;
  }, [list.data, schoolMetricsQueries]);

  const filteredSchools = useMemo(
    () => filterSchoolsBySearch(list.data ?? [], search),
    [list.data, search],
  );

  return {
    list,
    search,
    setSearch,
    filteredSchools,
    fallbackBySchoolId,
  };
}
