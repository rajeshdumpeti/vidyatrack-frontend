import { useQuery } from "@tanstack/react-query";
import { getPrincipalMarks } from "@/api/principalMarks.api";

export function usePrincipalMarksHistory(filters: {
  sectionId?: number;
  subjectId?: number;
  examType?: string;
}) {
  const enabled =
    typeof filters.sectionId === "number" &&
    typeof filters.subjectId === "number" &&
    typeof filters.examType === "string" &&
    filters.examType.length > 0;

  const q = useQuery({
    queryKey: [
      "principal-marks",
      {
        sectionId: filters.sectionId ?? null,
        subjectId: filters.subjectId ?? null,
        examType: filters.examType ?? null,
      },
    ],
    queryFn: () =>
      getPrincipalMarks({
        sectionId: filters.sectionId!,
        subjectId: filters.subjectId!,
        examType: filters.examType!,
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
