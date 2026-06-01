import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

import type { ManagementSchoolsOverviewResponse } from "@/types/managementSchools.types";

export async function getManagementSchoolsOverview(): Promise<ManagementSchoolsOverviewResponse> {
  const res = await apiClient.get<ManagementSchoolsOverviewResponse>(
    API_ENDPOINTS.management.schoolsOverview,
  );
  return res.data;
}
