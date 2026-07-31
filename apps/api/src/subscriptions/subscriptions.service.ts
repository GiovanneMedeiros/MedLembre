import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { BillingPeriod, Plano, Subscription, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FREE_TRIAL_HOURS, PLAN_LIMITS } from './plan-limits';
import {
  PAYMENT_PROVIDER,
  type ParsedWebhookEvent,
  type PaymentProvider,
} from './providers/payment-provider.interface';

const UPGRADABLE_PLANS: Plano[] = [
  Plano.ESSENCIAL,
  Plano.FAMILIA,
  Plano.PREMIUM,
];

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER) private readonly paymentProvider: PaymentProvider,
  ) {}

  async getOrCreate(userId: string) {
    const existing = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    return this.prisma.subscription.create({ data: { userId } });
  }

  async getPlano(userId: string): Promise<Plano> {
    const subscription = await this.getOrCreate(userId);
    return subscription.plano;
  }

  async hasAccessToFamily(userId: string): Promise<boolean> {
    const plano = await this.getPlano(userId);
    return plano === Plano.FAMILIA || plano === Plano.PREMIUM;
  }

  /**
   * O plano Grátis é um teste de FREE_TRIAL_HOURS a partir da criação da
   * assinatura — depois disso, null significa "não expira" (todo plano pago).
   */
  trialExpiresAt(subscription: Pick<Subscription, 'plano' | 'createdAt'>): Date | null {
    if (subscription.plano !== Plano.GRATIS) return null;
    return new Date(
      subscription.createdAt.getTime() + FREE_TRIAL_HOURS * 60 * 60 * 1000,
    );
  }

  isTrialExpired(subscription: Pick<Subscription, 'plano' | 'createdAt'>): boolean {
    const expiresAt = this.trialExpiresAt(subscription);
    return expiresAt !== null && expiresAt.getTime() <= Date.now();
  }

  async assertTrialActive(userId: string): Promise<void> {
    const subscription = await this.getOrCreate(userId);
    if (this.isTrialExpired(subscription)) {
      throw new ForbiddenException(
        `Seu período gratuito de ${FREE_TRIAL_HOURS}h expirou. Assine um plano para continuar usando o MedLembre.`,
      );
    }
  }

  async assertCanCreateMedication(userId: string): Promise<void> {
    await this.assertTrialActive(userId);

    const plano = await this.getPlano(userId);
    const limit = PLAN_LIMITS[plano].maxMedications;
    if (limit === null) return;

    const count = await this.prisma.medication.count({ where: { userId } });
    if (count >= limit) {
      throw new ForbiddenException(
        `Seu plano atual permite no máximo ${limit} medicamento${limit === 1 ? '' : 's'} cadastrado${limit === 1 ? '' : 's'}. Faça upgrade para cadastrar mais.`,
      );
    }
  }

  async assertCanCreateFamilyMember(userId: string): Promise<void> {
    await this.assertTrialActive(userId);

    const plano = await this.getPlano(userId);
    const limit = PLAN_LIMITS[plano].maxFamilyMembers;

    if (limit === 0) {
      throw new ForbiddenException(
        'A gestão de familiares está disponível apenas nos planos Família e Premium.',
      );
    }
    if (limit === null) return;

    const count = await this.prisma.familyMember.count({ where: { userId } });
    if (count >= limit) {
      throw new ForbiddenException(
        `Seu plano atual permite no máximo ${limit} perfis familiares. Faça upgrade para adicionar mais.`,
      );
    }
  }

  async getHistoryDaysLimit(userId: string): Promise<number | null> {
    const plano = await this.getPlano(userId);
    return PLAN_LIMITS[plano].historyDays;
  }

  async getCapabilities(userId: string) {
    const plano = await this.getPlano(userId);
    return PLAN_LIMITS[plano];
  }

  async assertEstoqueEnabled(userId: string): Promise<void> {
    const plano = await this.getPlano(userId);
    if (!PLAN_LIMITS[plano].estoqueEnabled) {
      throw new ForbiddenException(
        'O controle de estoque está disponível a partir do plano Essencial.',
      );
    }
  }

  async assertCanCreateEmergencyContact(userId: string): Promise<void> {
    const plano = await this.getPlano(userId);
    const limit = PLAN_LIMITS[plano].maxEmergencyContacts;

    if (limit === 0) {
      throw new ForbiddenException(
        'O contato de emergência está disponível nos planos Família e Premium.',
      );
    }

    const count = await this.prisma.emergencyContact.count({
      where: { userId },
    });
    if (count >= limit) {
      throw new ForbiddenException(
        `Seu plano atual permite no máximo ${limit} contato${limit === 1 ? '' : 's'} de emergência.`,
      );
    }
  }

  async createCheckoutSession(
    userId: string,
    email: string,
    plano: Plano,
    periodicidade: BillingPeriod,
    webOrigin: string,
  ) {
    if (!UPGRADABLE_PLANS.includes(plano)) {
      throw new BadRequestException('Plano inválido para assinatura.');
    }

    if (!this.paymentProvider.isConfigured()) {
      throw new ServiceUnavailableException(
        'Pagamentos ainda não estão configurados. Tente novamente mais tarde.',
      );
    }

    // Guarda a intenção (e-mail + plano pretendido) antes de redirecionar
    // ao checkout. Provedores sem API de sessão dinâmica (ex: Cakto, que
    // usa links de pagamento estáticos por produto) não têm como devolver
    // esses dados no webhook — usamos o que a própria aplicação já sabia.
    await this.getOrCreate(userId);
    await this.prisma.subscription.update({
      where: { userId },
      data: { email, pendingPlano: plano, pendingPeriodicidade: periodicidade },
    });

    return this.paymentProvider.createCheckoutSession({
      userId,
      email,
      plano,
      periodicidade,
      successUrl: `${webOrigin}/dashboard/assinatura?checkout=sucesso`,
      cancelUrl: `${webOrigin}/dashboard/assinatura?checkout=cancelado`,
    });
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.getOrCreate(userId);

    if (
      subscription.plano === Plano.GRATIS ||
      subscription.status === SubscriptionStatus.CANCELADA
    ) {
      throw new BadRequestException(
        'Você não possui uma assinatura ativa para cancelar.',
      );
    }

    if (subscription.providerSubscriptionId) {
      await this.paymentProvider.cancelSubscription(
        subscription.providerSubscriptionId,
      );
    }

    return this.prisma.subscription.update({
      where: { userId },
      data: { cancelAtPeriodEnd: true },
    });
  }

  verifyWebhookSignature(
    rawBody: Buffer,
    headers: Record<string, string | string[] | undefined>,
    query: Record<string, string | string[] | undefined>,
  ): boolean {
    return this.paymentProvider.verifyWebhookSignature({
      rawBody,
      headers,
      query,
    });
  }

  parseWebhookEvent(
    rawBody: Buffer,
    headers: Record<string, string | string[] | undefined>,
    query: Record<string, string | string[] | undefined>,
  ): ParsedWebhookEvent {
    return this.paymentProvider.parseWebhookEvent({ rawBody, headers, query });
  }

  /**
   * Processa um evento de webhook já verificado e parseado. Idempotente:
   * eventos repetidos (reenvio do provedor) são ignorados via a
   * constraint única em providerEventId. Esta é a ÚNICA via pela qual
   * plano/status de assinatura mudam — nunca a partir de uma chamada
   * direta do frontend.
   */
  async processWebhookEvent(
    provider: string,
    event: ParsedWebhookEvent,
  ): Promise<'processado' | 'duplicado'> {
    if (!event.providerEventId) {
      throw new BadRequestException('Evento de webhook sem identificador.');
    }

    const userId = await this.resolveUserId(event);

    try {
      await this.prisma.paymentEvent.create({
        data: {
          provider,
          providerEventId: event.providerEventId,
          type: event.type,
          userId,
          rawPayload: event.raw as never,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        this.logger.log(
          `Evento ${event.providerEventId} já processado — ignorando.`,
        );
        return 'duplicado';
      }
      throw error;
    }

    if (!userId) {
      this.logger.warn(
        `Evento ${event.providerEventId} (${event.type}) sem usuário identificável — ignorando.`,
      );
      return 'processado';
    }

    await this.applySubscriptionChange(provider, userId, event);
    return 'processado';
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return Boolean(
      error &&
      typeof error === 'object' &&
      (error as { code?: string }).code === 'P2002',
    );
  }

  private async applySubscriptionChange(
    provider: string,
    userId: string,
    event: ParsedWebhookEvent,
  ) {
    const subscription = await this.getOrCreate(userId);

    switch (event.type) {
      case 'PAGAMENTO_CONFIRMADO':
      case 'ASSINATURA_RENOVADA':
      case 'ASSINATURA_ATUALIZADA':
        await this.prisma.subscription.update({
          where: { userId },
          data: {
            status: SubscriptionStatus.ATIVA,
            cancelAtPeriodEnd: false,
            plano: event.plano ?? subscription.pendingPlano ?? undefined,
            periodicidade:
              event.periodicidade ?? subscription.pendingPeriodicidade ?? undefined,
            provider,
            providerCustomerId: event.providerCustomerId ?? undefined,
            providerSubscriptionId: event.providerSubscriptionId ?? undefined,
            currentPeriodEnd: event.currentPeriodEnd ?? undefined,
          },
        });
        break;

      case 'PAGAMENTO_RECUSADO':
        await this.prisma.subscription.update({
          where: { userId },
          data: { status: SubscriptionStatus.INADIMPLENTE },
        });
        break;

      case 'ASSINATURA_CANCELADA':
        await this.prisma.subscription.update({
          where: { userId },
          data: {
            status: SubscriptionStatus.CANCELADA,
            plano: Plano.GRATIS,
            periodicidade: null,
            cancelAtPeriodEnd: false,
          },
        });
        break;

      default:
        this.logger.warn(
          `Evento de tipo desconhecido recebido: ${JSON.stringify(event.raw)}`,
        );
    }
  }

  private async resolveUserId(
    event: ParsedWebhookEvent,
  ): Promise<string | null> {
    if (event.userId) return event.userId;

    if (event.providerSubscriptionId) {
      const existing = await this.prisma.subscription.findUnique({
        where: { providerSubscriptionId: event.providerSubscriptionId },
      });
      if (existing) return existing.userId;
    }

    if (event.providerCustomerId) {
      const existing = await this.prisma.subscription.findFirst({
        where: { providerCustomerId: event.providerCustomerId },
      });
      if (existing) return existing.userId;
    }

    if (event.payerEmail) {
      const existing = await this.prisma.subscription.findFirst({
        where: { email: event.payerEmail },
        orderBy: { updatedAt: 'desc' },
      });
      if (existing) return existing.userId;
    }

    return null;
  }
}
