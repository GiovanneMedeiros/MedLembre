import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { FamilyMember, Medication } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseAdminService } from '../supabase-admin/supabase-admin.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import {
  combineDateAndTime,
  currentTimeString,
  isWithinRange,
  toDateOnlyString,
} from '../common/medication-schedule.util';

type MedicationWithFamily = Medication & { familyMember: FamilyMember | null };

@Injectable()
export class RemindersScheduler {
  private readonly logger = new Logger(RemindersScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAdmin: SupabaseAdminService,
    private readonly whatsapp: WhatsAppService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleDueReminders() {
    const now = new Date();
    await this.sendDueNow(now);
    await this.resendSnoozed(now);
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
      if (!isWithinRange(today, medication.dataInicio, medication.dataFim)) continue;

      const scheduledFor = combineDateAndTime(today, horarioAtual);

      const [alreadyLogged, alreadyTaken] = await Promise.all([
        this.prisma.reminderLog.findUnique({
          where: { medicationId_scheduledFor: { medicationId: medication.id, scheduledFor } },
        }),
        this.prisma.doseRecord.findUnique({
          where: { medicationId_scheduledFor: { medicationId: medication.id, scheduledFor } },
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
        where: { medicationId_scheduledFor: { medicationId: log.medicationId, scheduledFor: log.scheduledFor } },
      });
      if (alreadyTaken) continue;

      await this.dispatchReminder(log.medication, log.scheduledFor, currentTimeString(log.scheduledFor));
    }
  }

  private async dispatchReminder(medication: MedicationWithFamily, scheduledFor: Date, horario: string) {
    const to =
      medication.familyMember?.whatsapp ??
      (await this.supabaseAdmin.getOwnerContact(medication.userId)).whatsapp;

    if (!to) {
      this.logger.warn(
        `Sem número de WhatsApp para lembrete de "${medication.nome}" (medicamento ${medication.id}).`,
      );
      return;
    }

    await this.whatsapp.sendMedicationReminder({
      userId: medication.userId,
      familyMemberId: medication.familyMemberId,
      medicationId: medication.id,
      medicationNome: medication.nome,
      horario,
      scheduledFor,
      to,
    });
  }
}
