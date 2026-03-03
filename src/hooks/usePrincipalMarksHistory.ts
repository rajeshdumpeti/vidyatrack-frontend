import { useQuery } from "@tanstack/react-query";
import { getPrincipalMarks } from "@/api/principalMarks.api";
import { useAuthStore } from "@/store/auth.store";

export function usePrincipalMarksHistory(filters: {
  sectionId?: number;
  subjectId?: number;
  examType?: string;
}) {
  const schoolId = useAuthStore((s) => s.schoolId);
  const enabled =
    typeof filters.subjectId === "number" &&
    typeof filters.examType === "string" &&
    filters.examType.length > 0 &&
    !!schoolId;

  const q = useQuery({
    queryKey: [
      "principal-marks",
      {
        sectionId: filters.sectionId ?? null,
        subjectId: filters.subjectId ?? null,
        examType: filters.examType ?? null,
        schoolId: schoolId ?? null,
      },
    ],
    queryFn: () =>
      getPrincipalMarks({
        sectionId: filters.sectionId,
        subjectId: filters.subjectId!,
        examType: filters.examType!,
        schoolId: schoolId!,
      }),
    enabled,
    retry: 1,
  });

  return {
    enabled,
    data: q.data,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
