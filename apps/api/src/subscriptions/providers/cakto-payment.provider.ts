import { timingSafeEqual } from 'node:crypto';
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

interface CaktoWebhookPayload {
  secret?: string;
  event?: string;
  data?: {
    id?: string;
    customer?: {
      name?: string;
      email?: string;
      phone?: string;
      docNumber?: string;
    };
    offer?: { id?: string; name?: string };
    product?: { id?: string; name?: string; type?: string };
    subscription?: {
      id?: string;
      status?: string;
      nextChargeAt?: string;
    } | null;
    status?: string;
    paidAt?: string;
    createdAt?: string;
    canceledAt?: string;
    refundedAt?: string;
    chargedbackAt?: string;
  };
}

const EVENT_TYPE_MAP: Record<string, PaymentEventType> = {
  purchase_approved: 'PAGAMENTO_CONFIRMADO',
  subscription_created: 'PAGAMENTO_CONFIRMADO',
  subscription_renewed: 'ASSINATURA_RENOVADA',
  purchase_refused: 'PAGAMENTO_RECUSADO',
  subscription_renewal_refused: 'PAGAMENTO_RECUSADO',
  subscription_canceled: 'ASSINATURA_CANCELADA',
  refund: 'ASSINATURA_CANCELADA',
  chargeback: 'ASSINATURA_CANCELADA',
};

/**
 * Integração com a Cakto (pay.cakto.com.br).
 *
 * A Cakto não tem API para criar uma sessão de checkout dinâmica: cada
 * produto/oferta gera um link de pagamento fixo (https://pay.cakto.com.br/{id})
 * configurado uma vez no painel deles. Por isso o checkout aqui é uma tabela
 * de links estáticos (um por plano × periodicidade, via env vars) com o
 * e-mail do usuário pré-preenchido via query string.
 *
 * O webhook da Cakto também não devolve um identificador nosso nem o plano
 * comprado — por isso o evento é resolvido pelo e-mail do pagador (ver
 * Subscription.email/pendingPlano em subscriptions.service.ts) em vez de
 * confiar em metadata que o provedor não fornece.
 *
 * Autenticidade: a Cakto envia a "Chave secreta do webhook" (configurada no
 * painel deles, Integrações → Webhooks) como o campo `secret` no próprio
 * corpo JSON — não como header nem assinatura HMAC. Confirmado via preview
 * de payload do painel (2026-07-29):
 * {
 *   "secret": "...", "event": "purchase_approved",
 *   "data": { "id": "...", "customer": { "email": "...", "docNumber": "..." },
 *     "subscription": null | { "id": "...", "nextChargeAt": "..." }, "paidAt": "..." }
 * }
 * "data.id" é o ID do PEDIDO, não da assinatura — o ID de assinatura fica em
 * "data.subscription.id" quando presente.
 */
@Injectable()
export class CaktoPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(CaktoPaymentProvider.name);
  private readonly checkoutUrls: Partial<Record<string, string>>;
  private readonly webhookSecret?: string;

  constructor(private readonly configService: ConfigService) {
    this.checkoutUrls = {
      [this.key(Plano.ESSENCIAL, BillingPeriod.MENSAL)]: this.env(
        'CAKTO_CHECKOUT_URL_ESSENCIAL_MENSAL',
      ),
      [this.key(Plano.ESSENCIAL, BillingPeriod.ANUAL)]: this.env(
        'CAKTO_CHECKOUT_URL_ESSENCIAL_ANUAL',
      ),
      [this.key(Plano.FAMILIA, BillingPeriod.MENSAL)]: this.env(
        'CAKTO_CHECKOUT_URL_FAMILIA_MENSAL',
      ),
      [this.key(Plano.FAMILIA, BillingPeriod.ANUAL)]: this.env(
        'CAKTO_CHECKOUT_URL_FAMILIA_ANUAL',
      ),
      [this.key(Plano.PREMIUM, BillingPeriod.MENSAL)]: this.env(
        'CAKTO_CHECKOUT_URL_PREMIUM_MENSAL',
      ),
      [this.key(Plano.PREMIUM, BillingPeriod.ANUAL)]: this.env(
        'CAKTO_CHECKOUT_URL_PREMIUM_ANUAL',
      ),
    };
    this.webhookSecret = this.env('CAKTO_WEBHOOK_TOKEN');
  }

  private env(name: string): string | undefined {
    return this.configService.get<string>(name) || undefined;
  }

  private key(plano: Plano, periodicidade: BillingPeriod): string {
    return `${plano}_${periodicidade}`;
  }

  isConfigured(): boolean {
    return Object.values(this.checkoutUrls).some(Boolean);
  }

  createCheckoutSession(
    input: CheckoutSessionInput,
  ): Promise<CheckoutSessionResult> {
    const baseUrl = this.checkoutUrls[this.key(input.plano, input.periodicidade)];
    if (!baseUrl) {
      throw new Error(
        `Link de checkout da Cakto não configurado para ${input.plano}/${input.periodicidade}.`,
      );
    }

    const url = new URL(baseUrl);
    url.searchParams.set('email', input.email);
    url.searchParams.set('confirmEmail', input.email);
    // Best-effort: a Cakto usa "src" para rastreamento de origem. Não há
    // confirmação de que ele volta no webhook — a resolução de usuário
    // real acontece por e-mail (ver comentário da classe).
    url.searchParams.set('src', input.userId);

    return Promise.resolve({ checkoutUrl: url.toString() });
  }

  cancelSubscription(providerSubscriptionId: string): Promise<void> {
    // A API pública da Cakto não documenta um endpoint de cancelamento de
    // assinatura. O status "cancelAtPeriodEnd" já é aplicado no nosso banco
    // (o usuário perde acesso no fim do período pago), mas a cobrança
    // recorrente em si só é interrompida cancelando manualmente no painel
    // da Cakto até esse endpoint ser confirmado.
    this.logger.warn(
      `Assinatura ${providerSubscriptionId} marcada para cancelamento no nosso banco — ` +
        `cancele manualmente no painel da Cakto para interromper a cobrança recorrente.`,
    );
    return Promise.resolve();
  }

  verifyWebhookSignature(data: WebhookRequestData): boolean {
    if (!this.webhookSecret) {
      this.logger.error(
        'CAKTO_WEBHOOK_TOKEN não configurado — recusando todos os webhooks de pagamento por segurança.',
      );
      return false;
    }

    let payload: CaktoWebhookPayload;
    try {
      payload = JSON.parse(data.rawBody.toString('utf8')) as CaktoWebhookPayload;
    } catch {
      return false;
    }

    const provided = payload.secret;
    if (typeof provided !== 'string') return false;

    const expected = this.webhookSecret;
    return (
      provided.length === expected.length &&
      timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
    );
  }

  parseWebhookEvent(data: WebhookRequestData): ParsedWebhookEvent {
    const payload = JSON.parse(
      data.rawBody.toString('utf8'),
    ) as CaktoWebhookPayload;

    const rawEvent = payload.event ?? '';
    const orderId = payload.data?.id ?? '';
    const timestamp =
      payload.data?.paidAt ??
      payload.data?.canceledAt ??
      payload.data?.refundedAt ??
      payload.data?.chargedbackAt ??
      payload.data?.createdAt ??
      '';

    // Nunca persiste o segredo compartilhado fora da verificação de
    // assinatura — ele não deve acabar armazenado no log de auditoria
    // (PaymentEvent.rawPayload).
    const { secret: _secret, ...rawWithoutSecret } = payload;

    return {
      // Combina evento + pedido + timestamp: a Cakto não expõe um id de
      // entrega de webhook no corpo (só no histórico do painel deles), e
      // reaproveitar só "evento:pedido" colidiria entre renovações da
      // mesma assinatura.
      providerEventId: orderId ? `${rawEvent}:${orderId}:${timestamp}` : '',
      type: EVENT_TYPE_MAP[rawEvent] ?? 'DESCONHECIDO',
      payerEmail: payload.data?.customer?.email,
      providerCustomerId: payload.data?.customer?.docNumber,
      providerSubscriptionId:
        (payload.data?.subscription?.id ?? orderId) || undefined,
      currentPeriodEnd: payload.data?.subscription?.nextChargeAt
        ? new Date(payload.data.subscription.nextChargeAt)
        : undefined,
      raw: rawWithoutSecret,
    };
  }
}
