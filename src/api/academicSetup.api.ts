import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type { AcademicSetupDto } from "@/types/academicSetup.types";

export async function getAcademicSetup(
  schoolId: number,
): Promise<AcademicSetupDto> {
  const res = await apiClient.get<AcademicSetupDto>(API_ENDPOINTS.academicSetup.list, {
    params: { school_id: schoolId },
  });
  return res.data;
}

