import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReminderStatus, type FamilyMember, type Medication } from '@prisma/client';
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

// A cada quantos minutos o app insiste no lembrete enquanto a dose segue
// sem resposta (nem "Tomei" nem "+5min"), e por quantas horas depois do
// horário previsto ele desiste de insistir (evita cutucar a pessoa a
// madrugada inteira por uma dose que ela não vai mais tomar).
export const NUDGE_INTERVAL_MINUTES = 5;
const NUDGE_GIVE_UP_HOURS = 4;

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
      const hoursLate = (now.getTime() - log.scheduledFor.getTime()) / 3_600_000;
      if (hoursLate > NUDGE_GIVE_UP_HOURS) {
        await this.prisma.reminderLog.update({
          where: { id: log.id },
          data: { snoozedUntil: null },
        });
        continue;
      }

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

    if (phoneDigits) {
      const baseInput = {
        userId: medication.userId,
        familyMemberId: medication.familyMemberId,
        medicationId: medication.id,
        medicationNome: medication.nome,
        horario,
        scheduledFor,
      };

      // Preferimos o WhatsApp oficial quando configurado; caso contrário,
      // caímos para SMS (Twilio) se disponível. Sem nenhum dos dois, o envio
      // pelo WhatsApp entra em modo simulado (apenas registra no ReminderLog).
      if (this.whatsapp.isConfigured() || !this.sms.isConfigured()) {
        await this.whatsapp.sendMedicationReminder({
          ...baseInput,
          to: toWhatsAppNumber(phoneDigits),
        });
      } else {
        await this.sms.sendMedicationReminder({ ...baseInput, to: phoneDigits });
      }
    } else {
      this.logger.warn(
        `Sem número de contato para lembrete de "${medication.nome}" (medicamento ${medication.id}).`,
      );
    }

    // Agenda a próxima insistência independente do canal usado acima — sem
    // isso, quem só recebe push (sem telefone cadastrado) nunca seria
    // lembrado de novo, já que o upsert do WhatsApp/SMS zera snoozedUntil
    // (esperando uma resposta explícita) e não roda de jeito nenhum quando
    // não há telefone.
    await this.scheduleNudge(medication, scheduledFor);
  }

  private async scheduleNudge(medication: MedicationWithFamily, scheduledFor: Date) {
    const snoozedUntil = new Date(
      Date.now() + NUDGE_INTERVAL_MINUTES * 60 * 1000,
    );

    await this.prisma.reminderLog.upsert({
      where: {
        medicationId_scheduledFor: {
          medicationId: medication.id,
          scheduledFor,
        },
      },
      create: {
        userId: medication.userId,
        medicationId: medication.id,
        familyMemberId: medication.familyMemberId,
        scheduledFor,
        status: ReminderStatus.SIMULADO,
        snoozedUntil,
      },
      update: { snoozedUntil },
    });
  }
}
