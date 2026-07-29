import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { FamilyMember, Medication } from '@prisma/client';
import {
  combineDateAndTime,
  currentTimeString,
  isWithinRange,
  toDateOnlyString,
} from '../common/medication-schedule.util';
import { toWhatsAppNumber } from '../common/phone.util';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from '../push/push.service';
import { SmsService } from '../sms/sms.service';
import { SupabaseAdminService } from '../supabase-admin/supabase-admin.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

type MedicationWithFamily = Medication & { familyMember: FamilyMember | null };

@Injectable()
export class RemindersScheduler {
  private readonly logger = new Logger(RemindersScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAdmin: SupabaseAdminService,
    private readonly whatsapp: WhatsAppService,
    private readonly sms: SmsService,
    private readonly push: PushService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleDueReminders() {
    try {
      const now = new Date();
      await this.sendDueNow(now);
      await this.resendSnoozed(now);
    } catch (error) {
      // Uma exceção não tratada aqui derruba o processo inteiro (Node
      // encerra em promise rejections não tratadas), tirando a API do ar
      // até o próximo restart — por isso o job nunca pode propagar.
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Falha ao processar lembretes agendados: ${message}`);
    }
  }

  private async sendDueNow(now: Date) {
    const today = toDateOnlyString(now);
    const dayOfWeek = now.getDay();
    const horarioAtual = currentTimeString(now);

    const medications = await this.prisma.medication.findMany({
      where: {
        status: 'ATIVO',
        horarios: { has: horarioAtual },
        diasSemana: { has: dayOfWeek },
      },
      include: { familyMember: true },
    });

    for (const medication of medications) {
      if (!isWithinRange(today, medication.dataInicio, medication.dataFim))
        continue;

      const scheduledFor = combineDateAndTime(today, horarioAtual);

      const [alreadyLogged, alreadyTaken] = await Promise.all([
        this.prisma.reminderLog.findUnique({
          where: {
            medicationId_scheduledFor: {
              medicationId: medication.id,
              scheduledFor,
            },
          },
        }),
        this.prisma.doseRecord.findUnique({
          where: {
            medicationId_scheduledFor: {
              medicationId: medication.id,
              scheduledFor,
            },
          },
        }),
      ]);
      if (alreadyLogged || alreadyTaken) continue;

      await this.dispatchReminder(medication, scheduledFor, horarioAtual);
    }
  }

  private async resendSnoozed(now: Date) {
    const dueSnoozed = await this.prisma.reminderLog.findMany({
      where: { snoozedUntil: { lte: now } },
      include: { medication: { include: { familyMember: true } } },
    });

    for (const log of dueSnoozed) {
      const alreadyTaken = await this.prisma.doseRecord.findUnique({
        where: {
          medicationId_scheduledFor: {
            medicationId: log.medicationId,
            scheduledFor: log.scheduledFor,
          },
        },
      });
      if (alreadyTaken) continue;

      await this.dispatchReminder(
        log.medication,
        log.scheduledFor,
        currentTimeString(log.scheduledFor),
      );
    }
  }

  private async dispatchReminder(
    medication: MedicationWithFamily,
    scheduledFor: Date,
    horario: string,
  ) {
    // Push é gratuito e só alcança o navegador do dono da conta (familiares
    // não têm login próprio), então é enviado sempre, em paralelo ao canal
    // de telefone — funciona mesmo se WhatsApp/SMS não estiverem configurados.
    this.push
      .sendMedicationReminder(
        medication.userId,
        medication.id,
        medication.nome,
        horario,
      )
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : 'Erro desconhecido';
        this.logger.error(
          `Falha ao enviar push para o usuário ${medication.userId}: ${message}`,
        );
      });

    const phoneDigits =
      medication.familyMember?.whatsapp ??
      (await this.supabaseAdmin.getOwnerContact(medication.userId)).whatsapp;

    if (!phoneDigits) {
      this.logger.warn(
        `Sem número de contato para lembrete de "${medication.nome}" (medicamento ${medication.id}).`,
      );
      return;
    }

    const baseInput = {
      userId: medication.userId,
      familyMemberId: medication.familyMemberId,
      medicationId: medication.id,
      medicationNome: medication.nome,
      horario,
      scheduledFor,
    };

    // Preferimos o WhatsApp oficial quando configurado; caso contrário, caímos
    // para SMS (Twilio) se disponível. Sem nenhum dos dois, o envio pelo
    // WhatsApp entra em modo simulado (apenas registra no ReminderLog).
    if (this.whatsapp.isConfigured() || !this.sms.isConfigured()) {
      await this.whatsapp.sendMedicationReminder({
        ...baseInput,
        to: toWhatsAppNumber(phoneDigits),
      });
      return;
    }

    await this.sms.sendMedicationReminder({ ...baseInput, to: phoneDigits });
  }
}
