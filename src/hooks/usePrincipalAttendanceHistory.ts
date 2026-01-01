import { useQuery } from "@tanstack/react-query";
import { getPrincipalAttendance } from "../api/principalAttendance.api";

export function usePrincipalAttendanceHistory(
  date: string,
  sectionId?: number
) {
  const query = useQuery({
    queryKey: ["principal-attendance", { date, sectionId: sectionId ?? null }],
    queryFn: () => getPrincipalAttendance({ date, sectionId }),
    enabled: Boolean(date),
    retry: 1,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
