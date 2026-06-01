import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type {
  ManagementAlertActionResponse,
  ManagementAlertHistoryResponse,
  ManagementDashboardResponse,
} from "@/types/managementDashboard.types";

export async function getManagementDashboard(params?: {
  school_id?: number | null;
  academic_year?: string | null;
}): Promise<ManagementDashboardResponse> {
  const res = await apiClient.get<ManagementDashboardResponse>(
    API_ENDPOINTS.management.dashboard,
    {
      params: {
        ...(params?.school_id ? { school_id: params.school_id } : {}),
        ...(params?.academic_year ? { academic_year: params.academic_year } : {}),
      },
    },
  );
  return res.data;
}

export async function postManagementAlertAction(payload: {
  alert_type: string;
  action_type: string;
  school_id?: number | null;
}): Promise<ManagementAlertActionResponse> {
  const res = await apiClient.post<ManagementAlertActionResponse>(
    API_ENDPOINTS.management.dashboardAlertAction,
    payload,
  );
  return res.data;
}

export async function getManagementAlertHistory(params?: {
  school_id?: number | null;
}): Promise<ManagementAlertHistoryResponse> {
  const res = await apiClient.get<ManagementAlertHistoryResponse>(
    API_ENDPOINTS.management.dashboardAlertHistory,
    {
      params: {
        ...(params?.school_id ? { school_id: params.school_id } : {}),
      },
    },
  );
  return res.data;
}
