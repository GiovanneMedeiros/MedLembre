import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { todayLocalDateString } from "../lib/date";
import { useFamilyScope } from "../contexts/FamilyScopeContext";
import type { DashboardSummary } from "../types/dashboard";

export function useDashboardSummary() {
  const dateOnly = todayLocalDateString();
  const { familyMemberId } = useFamilyScope();

  return useQuery({
    queryKey: ["dashboard-summary", dateOnly, familyMemberId],
    queryFn: () => {
      const params = new URLSearchParams({ date: dateOnly });
      if (familyMemberId) params.set("familyMemberId", familyMemberId);
      return api.get<DashboardSummary>(`/dashboard/summary?${params.toString()}`);
    },
    refetchInterval: 60_000,
  });
}
