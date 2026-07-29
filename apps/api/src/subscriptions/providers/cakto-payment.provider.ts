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
  event?: string;
  data?: {
    id?: string;
    customer?: {
      name?: string;
      email?: string;
      docNumber?: string;
      id?: string;
    };
    amount?: number;
    status?: string;
    paidAt?: string;
    renewedAt?: string;
    chargedAt?: string;
    nextChargeAt?: string;
    updatedAt?: string;
    createdAt?: string;
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
 * A Cakto não documenta publicamente um esquema de assinatura HMAC para
 * webhooks recebidos, então a autenticidade é validada por um token
 * compartilhado embutido na própria URL do webhook cadastrada no painel
 * deles (ex: https://sua-api/webhooks/payments/cakto?token=SEGREDO),
 * comparado aqui em tempo constante.
 *
 * IMPORTANTE: os nomes de campo do payload (data.id, data.customer.email,
 * etc.) foram confirmados apenas para o evento "purchase_approved" na
 * documentação pública da Cakto. Recomendado validar com um webhook de
 * teste real (painel Cakto → Integrações → Webhooks → Testar) e ajustar
 * aqui se os eventos de assinatura usarem nomes de campo diferentes.
 */
@Injectable()
export class CaktoPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(CaktoPaymentProvider.name);
  private readonly checkoutUrls: Partial<Record<string, string>>;
  private readonly webhookToken?: string;

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
    this.webhookToken = this.env('CAKTO_WEBHOOK_TOKEN');
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
    if (!this.webhookToken) {
      this.logger.error(
        'CAKTO_WEBHOOK_TOKEN não configurado — recusando todos os webhooks de pagamento por segurança.',
      );
      return false;
    }

    const provided = data.query.token;
    if (typeof provided !== 'string') return false;

    const expected = this.webhookToken;
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
    const objectId = payload.data?.id ?? '';
    const timestamp =
      payload.data?.paidAt ??
      payload.data?.renewedAt ??
      payload.data?.chargedAt ??
      payload.data?.updatedAt ??
      payload.data?.createdAt ??
      '';

    return {
      // Combina evento + objeto + timestamp: a Cakto não expõe um id de
      // entrega de webhook no corpo (apenas no histórico do painel deles),
      // e reaproveitar só "evento:id" colidiria entre renovações mensais
      // da mesma assinatura.
      providerEventId: objectId ? `${rawEvent}:${objectId}:${timestamp}` : '',
      type: EVENT_TYPE_MAP[rawEvent] ?? 'DESCONHECIDO',
      payerEmail: payload.data?.customer?.email,
      providerCustomerId:
        payload.data?.customer?.id ?? payload.data?.customer?.docNumber,
      providerSubscriptionId: objectId || undefined,
      currentPeriodEnd: payload.data?.nextChargeAt
        ? new Date(payload.data.nextChargeAt)
        : undefined,
      raw: payload,
    };
  }
}
