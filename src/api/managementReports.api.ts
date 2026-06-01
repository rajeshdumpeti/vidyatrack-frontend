import { apiClient } from "./apiClient";
import { schoolParams } from "./helpers/schoolParams";

export type ManagementReportsResponse = {
  success: boolean;
  data: {
    attendance_report: Array<{
      class_name: string;
      present_count: number;
      absent_count: number;
      attendance_pct: number;
    }>;
    exam_report: Array<{
      subject_name: string;
      exam_type: string;
      avg_marks_pct: number;
      pass_rate_pct: number;
    }>;
    fee_report: Array<{
      month: string;
      collected_amount: number;
      payment_count: number;
    }>;
    staff_report: Array<{
      name: string;
      role: string;
      status: string;
    }>;
    generated_at: string;
  };
};

export async function getManagementReports(
  schoolId: number,
): Promise<ManagementReportsResponse> {
  const res = await apiClient.get<ManagementReportsResponse>(
    "/api/v1/management/reports",
    { params: schoolParams(schoolId) },
  );
  return res.data;
}
