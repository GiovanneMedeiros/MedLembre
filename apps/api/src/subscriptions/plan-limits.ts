import { Plano } from '@prisma/client';

export interface PlanLimits {
  maxMedications: number | null;
  maxFamilyMembers: number | null;
  historyDays: number | null;
}

// null = ilimitado. Precisa ficar em sincronia com o que é anunciado
// em apps/web/src/data/plans.ts.
export const PLAN_LIMITS: Record<Plano, PlanLimits> = {
  GRATIS: { maxMedications: 1, maxFamilyMembers: 0, historyDays: 7 },
  ESSENCIAL: { maxMedications: 5, maxFamilyMembers: 0, historyDays: 30 },
  FAMILIA: { maxMedications: null, maxFamilyMembers: 5, historyDays: 90 },
  PREMIUM: { maxMedications: null, maxFamilyMembers: null, historyDays: null },
};
