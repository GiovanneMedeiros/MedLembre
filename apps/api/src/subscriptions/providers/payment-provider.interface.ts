import type { BillingPeriod, Plano } from '@prisma/client';

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');

export interface CheckoutSessionInput {
  userId: string;
  email: string;
  plano: Plano;
  periodicidade: BillingPeriod;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  checkoutUrl: string;
  providerSessionId?: string;
}

export type PaymentEventType =
  | 'PAGAMENTO_CONFIRMADO'
  | 'PAGAMENTO_RECUSADO'
  | 'ASSINATURA_CANCELADA'
  | 'ASSINATURA_RENOVADA'
  | 'ASSINATURA_ATUALIZADA'
  | 'DESCONHECIDO';

export interface ParsedWebhookEvent {
  providerEventId: string;
  type: PaymentEventType;
  userId?: string;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  /**
   * E-mail do pagador informado no evento. Usado para resolver o usuário
   * quando o provedor não devolve um identificador nosso (ex: Cakto, cujo
   * checkout é um link estático sem sessão dinâmica) — ver Subscription.email.
   */
  payerEmail?: string;
  plano?: Plano;
  periodicidade?: BillingPeriod;
  currentPeriodEnd?: Date;
  raw: unknown;
}

export interface WebhookRequestData {
  rawBody: Buffer;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[] | undefined>;
}

/**
 * Abstração do gateway de pagamento. O provedor real (Stripe, Cakto,
 * Mercado Pago...) ainda não foi escolhido — esta interface permite
 * plugar qualquer um deles depois sem alterar o restante da aplicação
 * (schema, controllers, máquina de estados da assinatura).
 *
 * Enquanto não houver um provedor real configurado, GenericPaymentProvider
 * cobre a validação de assinatura de webhook e o parsing de eventos com um
 * contrato HMAC simples e documentado, permitindo testar todo o fluxo
 * (checkout → confirmação → upgrade/downgrade → cancelamento → renovação)
 * de ponta a ponta antes de integrar o gateway definitivo.
 */
export interface PaymentProvider {
  isConfigured(): boolean;
  createCheckoutSession(
    input: CheckoutSessionInput,
  ): Promise<CheckoutSessionResult>;
  cancelSubscription(providerSubscriptionId: string): Promise<void>;
  verifyWebhookSignature(data: WebhookRequestData): boolean;
  parseWebhookEvent(data: WebhookRequestData): ParsedWebhookEvent;
}
