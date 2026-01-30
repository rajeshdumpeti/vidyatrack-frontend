import { apiClient } from "./apiClient";
import type { PrincipalMarksRowDto } from "@/types/principalMarks.types";

export async function getPrincipalMarks(params: {
  sectionId: number;
  subjectId: number;
  examType: string;
  schoolId: number;
}): Promise<PrincipalMarksRowDto[]> {
  const res = await apiClient.get<PrincipalMarksRowDto[]>("/api/v1/marks", {
    params: {
      section_id: params.sectionId,
      subject_id: params.subjectId,
      exam_type: params.examType,
      school_id: params.schoolId,
    },
  });

  return res.data;
}
