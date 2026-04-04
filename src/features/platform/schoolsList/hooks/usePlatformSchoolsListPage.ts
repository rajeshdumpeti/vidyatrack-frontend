import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/constants/queryKeys";
import { useDebounce } from "@/hooks/useDebounce";

export type SuperAdminSchool = {
  id: number;
  vt_school_id: string;
  name: string;
  initials: string;
  status: string;
  plan_type: string;
  is_test: boolean;
  setup_completion_pct: number;
  stats: { total_teachers: number; total_students: number };
  management_admin: {
    full_name: string | null;
    phone: string | null;
    last_login_at: string | null;
    last_login_relative: string;
  };
  created_at: string | null;
  last_activity_at: string | null;
};

type Summary = {
  total: number;
  active: number;
  pilot: number;
  setup_incomplete: number;
};

type Pagination = {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

type SchoolsResponse = {
  success: boolean;
  data: {
    summary: Summary;
    schools: SuperAdminSchool[];
    pagination: Pagination;
  };
};

export type SetupFilter = "all" | "complete" | "incomplete";
export type StatusFilter = "all" | "active" | "pilot" | "inactive" | "suspended";
export type SortBy = "name" | "created_at" | "last_active" | "student_count";

export function usePlatformSchoolsListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [setupFilter, setSetupFilter] = useState<SetupFilter>("all");
  const [showTest, setShowTest] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const debouncedSearch = useDebounce(search, 300);

  const params = {
    search: debouncedSearch || undefined,
    status: statusFilter,
    setup: setupFilter,
    show_test: showTest,
    page,
    per_page: 20,
    sort_by: sortBy,
    sort_order: sortOrder,
  };

  const query = useQuery({
    queryKey: queryKeys.superadminSchools(params),
    queryFn: async () => {
      const res = await apiClient.get<SchoolsResponse>(
        API_ENDPOINTS.superadmin.schools,
        { params },
      );
      return res.data.data;
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  function handleSearchChange(v: string) {
    setSearch(v);
    setPage(1);
  }

  function handleFilterChange(key: "status" | "setup", value: string) {
    if (key === "status") setStatusFilter(value as StatusFilter);
    if (key === "setup") setSetupFilter(value as SetupFilter);
    setPage(1);
  }

  return {
    query,
    search,
    setSearch: handleSearchChange,
    debouncedSearch,
    statusFilter,
    setupFilter,
    showTest,
    setShowTest: (v: boolean) => { setShowTest(v); setPage(1); },
    page,
    setPage,
    sortBy,
    setSortBy: (v: SortBy) => { setSortBy(v); setPage(1); },
    sortOrder,
    setSortOrder: (v: "asc" | "desc") => { setSortOrder(v); setPage(1); },
    handleFilterChange,
    schools: query.data?.schools ?? [],
    summary: query.data?.summary ?? null,
    pagination: query.data?.pagination ?? null,
  };
}
