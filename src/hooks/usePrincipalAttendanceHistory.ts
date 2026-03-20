import { useQuery } from "@tanstack/react-query";
import { getPrincipalAttendance } from "@/api/principalAttendance.api";
import { queryKeys } from "@/constants/queryKeys";

export function usePrincipalAttendanceHistory(
  date: string,
  sectionId?: number,
  schoolId?: number | null,
) {
  const query = useQuery({
    queryKey: queryKeys.principalAttendance({ date, sectionId, schoolId }),
    queryFn: () =>
      getPrincipalAttendance({ date, sectionId, school_id: schoolId! }),
    enabled: Boolean(date && schoolId),
    retry: 1,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
