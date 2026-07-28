import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useFamilyScope } from "../contexts/FamilyScopeContext";
import type { HistoricoResult } from "../types/dashboard";

export function useHistorico() {
  const { familyMemberId } = useFamilyScope();

  return useQuery({
    queryKey: ["historico", familyMemberId],
    queryFn: () => {
      const params = familyMemberId ? `?familyMemberId=${familyMemberId}` : "";
      return api.get<HistoricoResult>(`/dashboard/historico${params}`);
    },
  });
}
