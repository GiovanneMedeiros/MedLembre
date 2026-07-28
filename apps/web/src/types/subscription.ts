export type Plano = "GRATIS" | "ESSENCIAL" | "FAMILIA" | "PREMIUM";
export type SubscriptionStatus = "ATIVA" | "INADIMPLENTE" | "CANCELADA";
export type BillingPeriod = "MENSAL" | "ANUAL";

export interface SubscriptionInfo {
  plano: Plano;
  status: SubscriptionStatus;
  periodicidade: BillingPeriod | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasFamilyAccess: boolean;
}

export interface CheckoutResult {
  checkoutUrl: string;
}
