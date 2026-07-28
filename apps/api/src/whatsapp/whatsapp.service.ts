import { Inject, Injectable, Logger } from '@nestjs/common';
import { ReminderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WHATSAPP_PROVIDER, type WhatsAppProvider } from './providers/whatsapp-provider.interface';
import {
  buildConfirmationMessage,
  buildReminderButtons,
  buildReminderMessage,
  buildSnoozeMessage,
} from './templates/message-templates';

interface SendMedicationReminderInput {
  userId: string;
  familyMemberId: string | null;
  medicationId: string;
  medicationNome: string;
  horario: string;
  scheduledFor: Date;
  to: string;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    @Inject(WHATSAPP_PROVIDER) private readonly provider: WhatsAppProvider,
    private readonly prisma: PrismaService,
  ) {}

  async sendMedicationReminder(input: SendMedicationReminderInput) {
    const message = buildReminderMessage(input.medicationNome, input.horario);
    const buttons = buildReminderButtons(input.medicationId, input.scheduledFor.toISOString());

    const result = await this.provider.sendButtonsMessage(input.to, message, buttons);

    const status: ReminderStatus = result.simulated
      ? ReminderStatus.SIMULADO
      : result.errorMessage
        ? ReminderStatus.FALHOU
        : ReminderStatus.ENVIADO;

    await this.prisma.reminderLog.upsert({
      where: {
        medicationId_scheduledFor: {
          medicationId: input.medicationId,
          scheduledFor: input.scheduledFor,
        },
      },
      create: {
        userId: input.userId,
        medicationId: input.medicationId,
        familyMemberId: input.familyMemberId,
        scheduledFor: input.scheduledFor,
        status,
        providerMessageId: result.providerMessageId,
        errorMessage: result.errorMessage,
      },
      update: {
        status,
        providerMessageId: result.providerMessageId,
        errorMessage: result.errorMessage,
        snoozedUntil: null,
      },
    });

    this.logger.log(
      `Lembrete de "${input.medicationNome}" para ${input.to} às ${input.horario} — status: ${status}`,
    );

    return result;
  }

  async sendMedicationConfirmation(to: string, medicationNome: string) {
    return this.provider.sendTextMessage(to, buildConfirmationMessage(medicationNome));
  }

  async sendMedicationSnooze(to: string, medicationNome: string, minutes = 10) {
    return this.provider.sendTextMessage(to, buildSnoozeMessage(medicationNome, minutes));
  }

  async sendFamilyNotification(to: string, message: string) {
    return this.provider.sendTextMessage(to, message);
  }
}
