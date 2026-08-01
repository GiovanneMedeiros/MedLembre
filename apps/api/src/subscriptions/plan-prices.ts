import { Plano } from '@prisma/client';

// Espelha apps/web/src/data/plans.ts — usado só pra estimar receita
// recorrente no painel /adm (nunca pra cobrança real, que é 100% definida
// pela Cakto). Se o preço mudar lá, precisa atualizar aqui também.
export const PLAN_MONTHLY_PRICE: Record<Plano, number> = {
  GRATIS: 0,
  ESSENCIAL: 39.9,
  FAMILIA: 59.9,
  PREMIUM: 79.9,
};

export const PLAN_ANNUAL_PRICE: Record<Plano, number | null> = {
  GRATIS: null,
  ESSENCIAL: 359,
  FAMILIA: 539,
  PREMIUM: 719,
};
