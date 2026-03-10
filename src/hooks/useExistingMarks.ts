import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/store/auth.store";

type ExistingMarksData = {
  marksMap: Record<string, string>;
  maxMarks: number | null;
};

type ExistingMarksRecord = {
  student_id?: number | string | null;
  marks_obtained?: number | string | null;
  max_marks?: number | null;
};

export function useExistingMarks(
  sectionId?: number,
  subjectId?: number,
  examType?: string,
) {
  const schoolId = useAuthStore((s) => s.schoolId);

  return useQuery({
    queryKey: queryKeys.existingMarks({
      sectionId,
      subjectId,
      examType,
      schoolId,
    }),
    queryFn: async () => {
      if (!sectionId || !subjectId || !examType || !schoolId) {
        return { marksMap: {}, maxMarks: null } satisfies ExistingMarksData;
      }

      try {
        const response = await apiClient.get(API_ENDPOINTS.marks.list, {
          params: {
            section_id: sectionId,
            subject_id: subjectId,
            exam_type: examType,
            school_id: schoolId,
          },
        });

        // Transform API response to { studentId: marks } mapping + inferred max marks.
        const marksMap: Record<string, string> = {};
        let maxMarks: number | null = null;

        ((response.data || []) as ExistingMarksRecord[]).forEach((record) => {
          if (record.student_id && record.marks_obtained != null) {
            marksMap[record.student_id.toString()] =
              record.marks_obtained.toString();
          }
          if (typeof record.max_marks === "number" && record.max_marks > 0) {
            maxMarks = maxMarks ?? record.max_marks;
          }
        });

        return { marksMap, maxMarks } satisfies ExistingMarksData;
      } catch {
        // If no marks exist, return empty object
        return { marksMap: {}, maxMarks: null } satisfies ExistingMarksData;
      }
    },
    enabled: !!sectionId && !!subjectId && !!examType && !!schoolId,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: "always",
    retry: 1,
  });
}
