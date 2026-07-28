import { Inject, Injectable, Logger } from '@nestjs/common';
import { ReminderChannel, ReminderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SMS_PROVIDER, type SmsProvider } from './providers/sms-provider.interface';
import { buildSmsReminderMessage } from './templates/sms-templates';

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
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    @Inject(SMS_PROVIDER) private readonly provider: SmsProvider,
    private readonly prisma: PrismaService,
  ) {}

  isConfigured(): boolean {
    return this.provider.isConfigured();
  }

  async sendMedicationReminder(input: SendMedicationReminderInput) {
    const message = buildSmsReminderMessage(input.medicationNome, input.horario);
    const result = await this.provider.sendTextMessage(input.to, message);

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
        channel: ReminderChannel.SMS,
        status,
        providerMessageId: result.providerMessageId,
        errorMessage: result.errorMessage,
      },
      update: {
        channel: ReminderChannel.SMS,
        status,
        providerMessageId: result.providerMessageId,
        errorMessage: result.errorMessage,
        snoozedUntil: null,
      },
    });

    this.logger.log(
      `Lembrete de "${input.medicationNome}" via SMS para ${input.to} às ${input.horario} — status: ${status}`,
    );

    return result;
  }
}
