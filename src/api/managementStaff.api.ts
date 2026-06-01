import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type {
  ManagementStaffCompensationInput,
  ManagementStaffListItemDto,
  ManagementStaffListResponse,
  ManagementStaffPayrollProcessResponse,
  ManagementStaffStatsResponse,
} from "@/types/managementStaff.types";

export async function getManagementStaffList(params?: {
  school_id?: number | null;
  search?: string;
  role?: string;
}): Promise<ManagementStaffListResponse> {
  const res = await apiClient.get<ManagementStaffListResponse>(API_ENDPOINTS.management.staffList, {
    params: {
      ...(params?.school_id ? { school_id: params.school_id } : {}),
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.role ? { role: params.role } : {}),
    },
  });
  return res.data;
}

export async function getManagementStaffStats(params?: {
  school_id?: number | null;
}): Promise<ManagementStaffStatsResponse> {
  const res = await apiClient.get<ManagementStaffStatsResponse>(API_ENDPOINTS.management.staffStats, {
    params: {
      ...(params?.school_id ? { school_id: params.school_id } : {}),
    },
  });
  return res.data;
}

export async function patchManagementStaffCompensation(
  userId: number,
  payload: ManagementStaffCompensationInput,
  schoolId?: number | null,
): Promise<ManagementStaffListItemDto> {
  const res = await apiClient.patch<ManagementStaffListItemDto>(
    API_ENDPOINTS.management.staffCompensation(userId),
    payload,
    {
      params: {
        ...(schoolId ? { school_id: schoolId } : {}),
      },
    },
  );
  return res.data;
}

export async function postManagementStaffPayrollProcess(payload: {
  school_id?: number | null;
  user_id?: number | null;
  payroll_month?: string | null;
  reference_note?: string | null;
}): Promise<ManagementStaffPayrollProcessResponse> {
  const res = await apiClient.post<ManagementStaffPayrollProcessResponse>(
    API_ENDPOINTS.management.staffPayrollProcess,
    payload,
  );
  return res.data;
}
