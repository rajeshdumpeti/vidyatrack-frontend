import { useQuery } from "@tanstack/react-query";
import { getPrincipalDashboard } from "@/api/principalDashboard.api";

export function usePrincipalDashboard() {
  return useQuery({
    queryKey: ["principal-dashboard"],
    queryFn: getPrincipalDashboard,
    retry: 1,
  });
}
