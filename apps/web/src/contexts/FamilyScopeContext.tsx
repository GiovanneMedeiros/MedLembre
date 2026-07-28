import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useFamilyMembers } from "../hooks/useFamilyMembers";
import { useSubscription } from "../hooks/useSubscription";

interface FamilyScopeContextValue {
  familyMemberId: string | null;
  setFamilyMemberId: (id: string | null) => void;
  currentLabel: string;
  canSwitch: boolean;
}

const FamilyScopeContext = createContext<FamilyScopeContextValue | undefined>(undefined);

export function FamilyScopeProvider({ children }: { children: ReactNode }) {
  const { data: subscription } = useSubscription();
  const { data: familyMembers } = useFamilyMembers();
  const [familyMemberId, setFamilyMemberId] = useState<string | null>(null);

  const currentLabel = useMemo(() => {
    if (!familyMemberId) return "Minha conta";
    return familyMembers?.find((member) => member.id === familyMemberId)?.nome ?? "Minha conta";
  }, [familyMemberId, familyMembers]);

  const canSwitch = Boolean(subscription?.hasFamilyAccess && familyMembers && familyMembers.length > 0);

  return (
    <FamilyScopeContext.Provider value={{ familyMemberId, setFamilyMemberId, currentLabel, canSwitch }}>
      {children}
    </FamilyScopeContext.Provider>
  );
}

export function useFamilyScope() {
  const context = useContext(FamilyScopeContext);
  if (!context) {
    throw new Error("useFamilyScope deve ser usado dentro de um FamilyScopeProvider");
  }
  return context;
}
