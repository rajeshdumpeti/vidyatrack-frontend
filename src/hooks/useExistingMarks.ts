import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { MarksExamTypeDto } from "@/types/marks-submit.types";

export function useExistingMarks(
  sectionId?: number,
  subjectId?: number,
  examType?: MarksExamTypeDto,
) {
  return useQuery({
    queryKey: ["existing-marks", sectionId, subjectId, examType],
    queryFn: async () => {
      if (!sectionId || !subjectId || !examType) {
        return {};
      }

      try {
        const response = await apiClient.get(API_ENDPOINTS.marks.list, {
          params: {
            section_id: sectionId,
            subject_id: subjectId,
            exam_type: examType,
          },
        });

        // Transform API response to { studentId: marks } mapping
        const marksMap: Record<string, string> = {};

        // Assuming API returns array of marks records like:
        // [{ student_id: 1, marks_obtained: 85 }, ...]
        (response.data || []).forEach((record: any) => {
          if (record.student_id && record.marks_obtained !== undefined) {
            marksMap[record.student_id.toString()] =
              record.marks_obtained.toString();
          }
        });

        return marksMap;
      } catch (error) {
        // If 404 or no marks exist, return empty object
        return {};
      }
    },
    enabled: !!sectionId && !!subjectId && !!examType,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
