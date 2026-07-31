export type Plano = "GRATIS" | "ESSENCIAL" | "FAMILIA" | "PREMIUM";
export type SubscriptionStatus = "ATIVA" | "INADIMPLENTE" | "CANCELADA";
export type BillingPeriod = "MENSAL" | "ANUAL";

export interface PlanCapabilities {
  maxMedications: number | null;
  maxFamilyMembers: number | null;
  historyDays: number | null;
  whatsappEnabled: boolean;
  estoqueEnabled: boolean;
  maxEmergencyContacts: number;
  weeklyReportEnabled: boolean;
  conflictAlertEnabled: boolean;
}

export interface SubscriptionInfo {
  plano: Plano;
  status: SubscriptionStatus;
  periodicidade: BillingPeriod | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasFamilyAccess: boolean;
  trialExpiresAt: string | null;
  trialExpired: boolean;
  capabilities: PlanCapabilities;
}

export interface CheckoutResult {
  checkoutUrl: string;
}
