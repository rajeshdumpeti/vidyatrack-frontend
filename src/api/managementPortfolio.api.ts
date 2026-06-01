import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import { schoolParams } from "./helpers/schoolParams";

import type {
  ManagementStaffSummaryDto,
  ManagementStudentsSummaryDto,
} from "@/types/managementPortfolio.types";

export async function getManagementStudentsSummary(
  schoolId: number,
): Promise<ManagementStudentsSummaryDto> {
  const res = await apiClient.get<ManagementStudentsSummaryDto>(
    API_ENDPOINTS.management.portfolioStudentsSummary,
    { params: schoolParams(schoolId) },
  );
  return res.data;
}

export async function getManagementStaffSummary(
  schoolId: number,
): Promise<ManagementStaffSummaryDto> {
  const res = await apiClient.get<ManagementStaffSummaryDto>(
    API_ENDPOINTS.management.portfolioStaffSummary,
    { params: schoolParams(schoolId) },
  );
  return res.data;
}

export function getManagementStudentsExportUrl(schoolId: number) {
  return `${API_ENDPOINTS.management.portfolioStudentsExport}?school_id=${schoolId}`;
}

export function getManagementStaffExportUrl(schoolId: number) {
  return `${API_ENDPOINTS.management.portfolioStaffExport}?school_id=${schoolId}`;
}
