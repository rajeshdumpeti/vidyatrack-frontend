import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type { PrincipalDashboardDto } from "@/types/managementPrincipal.types";

export async function getPrincipalDashboard(): Promise<PrincipalDashboardDto> {
  const res = await apiClient.get<PrincipalDashboardDto>(
    API_ENDPOINTS.principal.dashboard,
  );
  return res.data;
}
