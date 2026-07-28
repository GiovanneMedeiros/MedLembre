import { createHmac, timingSafeEqual } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingPeriod, Plano } from '@prisma/client';
import type {
  CheckoutSessionInput,
  CheckoutSessionResult,
  ParsedWebhookEvent,
  PaymentEventType,
  PaymentProvider,
  WebhookRequestData,
} from './payment-provider.interface';

/**
 * Implementação de referência, sem gateway real por trás. Cobre a
 * verificação de assinatura (HMAC-SHA256 sobre o corpo bruto) e o
 * parsing de um payload JSON genérico e documentado abaixo, permitindo
 * testar todo o fluxo de assinatura antes do gateway definitivo ser
 * escolhido. Quando o provedor real entrar (Stripe, Cakto, Mercado
 * Pago...), basta criar uma classe nova implementando PaymentProvider
 * e trocar o binding em subscriptions.module.ts — nada mais no app
 * precisa mudar.
 *
 * Contrato esperado do webhook (JSON no corpo, header
 * "x-webhook-signature" com HMAC-SHA256 hex do corpo bruto usando
 * PAYMENT_WEBHOOK_SECRET):
 * {
 *   "eventId": "evt_123",              // usado para idempotência
 *   "type": "payment.confirmed" | "payment.failed" | "subscription.canceled"
 *           | "subscription.renewed" | "subscription.updated",
 *   "userId": "uuid-do-usuario",
 *   "customerId": "cus_123",
 *   "subscriptionId": "sub_123",
 *   "plano": "ESSENCIAL" | "FAMILIA" | "PREMIUM",
 *   "periodicidade": "MENSAL" | "ANUAL",
 *   "currentPeriodEnd": "2026-08-28T00:00:00.000Z"
 * }
 */
@Injectable()
export class GenericPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(GenericPaymentProvider.name);
  private readonly checkoutBaseUrl?: string;
  private readonly webhookSecret?: string;

  constructor(private readonly configService: ConfigService) {
    this.checkoutBaseUrl =
      this.configService.get<string>('PAYMENT_CHECKOUT_BASE_URL') || undefined;
    this.webhookSecret =
      this.configService.get<string>('PAYMENT_WEBHOOK_SECRET') || undefined;
  }

  isConfigured(): boolean {
    return Boolean(this.checkoutBaseUrl);
  }

  createCheckoutSession(
    input: CheckoutSessionInput,
  ): Promise<CheckoutSessionResult> {
    if (!this.checkoutBaseUrl) {
      throw new Error(
        'Gateway de pagamento não configurado (PAYMENT_CHECKOUT_BASE_URL ausente).',
      );
    }

    const url = new URL(this.checkoutBaseUrl);
    url.searchParams.set('uid', input.userId);
    url.searchParams.set('email', input.email);
    url.searchParams.set('plano', input.plano);
    url.searchParams.set('periodicidade', input.periodicidade);
    url.searchParams.set('success_url', input.successUrl);
    url.searchParams.set('cancel_url', input.cancelUrl);

    return Promise.resolve({ checkoutUrl: url.toString() });
  }

  cancelSubscription(providerSubscriptionId: string): Promise<void> {
    this.logger.warn(
      `[SIMULADO] Cancelamento solicitado para ${providerSubscriptionId} — nenhum gateway real configurado.`,
    );
    return Promise.resolve();
  }

  verifyWebhookSignature(data: WebhookRequestData): boolean {
    if (!this.webhookSecret) {
      // Diferente do webhook do WhatsApp (que degrada com aviso), aqui
      // falhamos fechado: um webhook de pagamento sem verificação
      // permitiria conceder planos pagos de graça para qualquer um que
      // descobrisse o endpoint. Sem segredo configurado, nenhum evento
      // é aceito.
      this.logger.error(
        'PAYMENT_WEBHOOK_SECRET não configurado — recusando todos os webhooks de pagamento por segurança.',
      );
      return false;
    }

    const signatureHeader = data.headers['x-webhook-signature'];
    if (typeof signatureHeader !== 'string') return false;

    const expected = createHmac('sha256', this.webhookSecret)
      .update(data.rawBody)
      .digest('hex');

    return (
      signatureHeader.length === expected.length &&
      timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected))
    );
  }

  parseWebhookEvent(data: WebhookRequestData): ParsedWebhookEvent {
    const payload = JSON.parse(data.rawBody.toString('utf8')) as Record<
      string,
      unknown
    >;

    const typeMap: Record<string, PaymentEventType> = {
      'payment.confirmed': 'PAGAMENTO_CONFIRMADO',
      'payment.failed': 'PAGAMENTO_RECUSADO',
      'subscription.canceled': 'ASSINATURA_CANCELADA',
      'subscription.renewed': 'ASSINATURA_RENOVADA',
      'subscription.updated': 'ASSINATURA_ATUALIZADA',
    };

    const rawType = typeof payload.type === 'string' ? payload.type : '';
    const plano =
      typeof payload.plano === 'string' ? (payload.plano as Plano) : undefined;
    const periodicidade =
      typeof payload.periodicidade === 'string'
        ? (payload.periodicidade as BillingPeriod)
        : undefined;

    return {
      providerEventId:
        typeof payload.eventId === 'string' ? payload.eventId : '',
      type: typeMap[rawType] ?? 'DESCONHECIDO',
      userId: typeof payload.userId === 'string' ? payload.userId : undefined,
      providerCustomerId:
        typeof payload.customerId === 'string' ? payload.customerId : undefined,
      providerSubscriptionId:
        typeof payload.subscriptionId === 'string'
          ? payload.subscriptionId
          : undefined,
      plano:
        plano && (Object.values(Plano) as string[]).includes(plano)
          ? plano
          : undefined,
      periodicidade:
        periodicidade &&
        (Object.values(BillingPeriod) as string[]).includes(periodicidade)
          ? periodicidade
          : undefined,
      currentPeriodEnd:
        typeof payload.currentPeriodEnd === 'string'
          ? new Date(payload.currentPeriodEnd)
          : undefined,
      raw: payload,
    };
  }
}
