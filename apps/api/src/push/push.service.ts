import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';
import type { SubscribePushDto } from './dto/subscribe-push.dto';

interface ReminderPushPayload {
  title: string;
  body: string;
  medicationId: string;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly publicKey?: string;
  private readonly configured: boolean;

  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.publicKey = configService.get<string>('VAPID_PUBLIC_KEY') || undefined;
    const privateKey = configService.get<string>('VAPID_PRIVATE_KEY') || undefined;
    const subject = configService.get<string>('VAPID_SUBJECT') || undefined;

    this.configured = Boolean(this.publicKey && privateKey && subject);

    if (this.configured) {
      webpush.setVapidDetails(subject as string, this.publicKey as string, privateKey as string);
    } else {
      this.logger.warn('VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY/VAPID_SUBJECT ausentes — Web Push desativado.');
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  getPublicKey(): string | null {
    return this.publicKey ?? null;
  }

  async subscribe(userId: string, dto: SubscribePushDto) {
    await this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      create: {
        userId,
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
      },
      update: {
        userId,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
      },
    });
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
  }

  async sendMedicationReminder(userId: string, medicationId: string, medicationNome: string, horario: string) {
    if (!this.configured) return;

    const subscriptions = await this.prisma.pushSubscription.findMany({ where: { userId } });
    if (subscriptions.length === 0) return;

    const payload: ReminderPushPayload = {
      title: '💊 Hora do medicamento',
      body: `${medicationNome} — ${horario}`,
      medicationId,
    };

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: { p256dh: subscription.p256dh, auth: subscription.auth },
            },
            JSON.stringify(payload),
          );
        } catch (error) {
          const statusCode = (error as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await this.prisma.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => undefined);
            return;
          }
          const message = error instanceof Error ? error.message : 'Erro desconhecido';
          this.logger.error(`Falha ao enviar push para ${subscription.endpoint}: ${message}`);
        }
      }),
    );
  }
}
