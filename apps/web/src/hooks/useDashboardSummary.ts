import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { todayLocalDateString } from "../lib/date";
import type { DashboardSummary } from "../types/dashboard";

export function useDashboardSummary() {
  const dateOnly = todayLocalDateString();

  return useQuery({
    queryKey: ["dashboard-summary", dateOnly],
    queryFn: () => api.get<DashboardSummary>(`/dashboard/summary?date=${dateOnly}`),
    refetchInterval: 60_000,
  });
}
