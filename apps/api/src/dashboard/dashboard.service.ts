import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import {
  combineDateAndTime,
  isWithinRange,
  toDateOnlyString,
} from '../common/medication-schedule.util';
import type {
  DashboardSummary,
  DoseStatus,
  EstoqueAlerta,
  HistoricoResult,
  TimelineItem,
} from './dashboard.types';

const LATE_GRACE_MINUTES = 30;
const LOOKAHEAD_DAYS = 7;
const HISTORY_HARD_CAP_DAYS = 365;

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async getSummary(
    userId: string,
    dateOnly?: string,
    familyMemberId?: string | null,
  ): Promise<DashboardSummary> {
    const today = dateOnly ?? toDateOnlyString(new Date());
    const now = new Date();
    const scopeWhere = { userId, familyMemberId: familyMemberId ?? null };

    const [medications, totalCount] = await Promise.all([
      this.prisma.medication.findMany({
        where: { ...scopeWhere, status: 'ATIVO' },
      }),
      this.prisma.medication.count({ where: scopeWhere }),
    ]);

    const dayOfWeek = combineDateAndTime(today, '00:00').getDay();

    const relevantMedications = medications.filter(
      (m) =>
        m.diasSemana.includes(dayOfWeek) &&
        isWithinRange(today, m.dataInicio, m.dataFim),
    );

    const doseRecordsToday = await this.prisma.doseRecord.findMany({
      where: {
        userId,
        medicationId: { in: medications.map((m) => m.id) },
        scheduledFor: {
          gte: combineDateAndTime(today, '00:00'),
          lt: combineDateAndTime(today, '23:59'),
        },
      },
    });

    const takenSet = new Set(
      doseRecordsToday.map((d) => d.scheduledFor.toISOString()),
    );

    const timelineHoje: TimelineItem[] = [];

    for (const medication of relevantMedications) {
      for (const horario of medication.horarios) {
        const scheduledFor = combineDateAndTime(today, horario);
        const isTaken = takenSet.has(scheduledFor.toISOString());

        let status: DoseStatus;
        if (isTaken) {
          status = 'tomado';
        } else {
          const minutesLate = (now.getTime() - scheduledFor.getTime()) / 60000;
          status = minutesLate > LATE_GRACE_MINUTES ? 'atrasado' : 'pendente';
        }

        timelineHoje.push({
          medicationId: medication.id,
          nome: medication.nome,
          dosagem: medication.dosagem,
          cor: medication.cor,
          fotoUrl: medication.fotoUrl,
          horario,
          scheduledFor: scheduledFor.toISOString(),
          status,
        });
      }
    }

    timelineHoje.sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));

    const nextPendingIndex = timelineHoje.findIndex(
      (item) => item.status === 'pendente',
    );
    if (nextPendingIndex !== -1) {
      timelineHoje[nextPendingIndex] = {
        ...timelineHoje[nextPendingIndex],
        status: 'proximo',
      };
    }

    let proximoMedicamento =
      timelineHoje.find((item) => item.status === 'proximo') ?? null;

    if (!proximoMedicamento) {
      proximoMedicamento = await this.findNextUpcoming(
        userId,
        today,
        familyMemberId ?? null,
      );
    }

    const medicamentosTomadosHoje = timelineHoje.filter(
      (item) => item.status === 'tomado',
    ).length;
    const lembretesPendentesHoje = timelineHoje.filter((item) =>
      ['pendente', 'proximo', 'atrasado'].includes(item.status),
    ).length;

    const adesaoSemanal = await this.computeWeeklyAdherence(
      userId,
      familyMemberId ?? null,
      today,
      now,
    );

    const alertasEstoque = await this.computeEstoqueAlertas(userId, medications);

    return {
      medicamentosCadastrados: totalCount,
      medicamentosTomadosHoje,
      lembretesPendentesHoje,
      proximoMedicamento,
      timelineHoje,
      adesaoSemanal,
      alertasEstoque,
    };
  }

  private async computeEstoqueAlertas(
    userId: string,
    medications: { id: string; nome: string; estoqueQuantidade: number | null; estoqueAlertaLimiar: number | null }[],
  ): Promise<EstoqueAlerta[]> {
    const capabilities = await this.subscriptionsService.getCapabilities(userId);
    if (!capabilities.estoqueEnabled) return [];

    return medications
      .filter(
        (m) =>
          m.estoqueQuantidade !== null &&
          m.estoqueAlertaLimiar !== null &&
          m.estoqueQuantidade <= m.estoqueAlertaLimiar,
      )
      .map((m) => ({
        medicationId: m.id,
        nome: m.nome,
        estoqueQuantidade: m.estoqueQuantidade as number,
      }));
  }

  async computeWeeklyAdherence(
    userId: string,
    familyMemberId: string | null,
    todayOnly: string,
    now: Date,
  ): Promise<number | null> {
    const medications = await this.prisma.medication.findMany({
      where: { userId, familyMemberId, status: 'ATIVO' },
    });
    if (medications.length === 0) return null;

    const startDate = combineDateAndTime(todayOnly, '00:00');
    startDate.setDate(startDate.getDate() - 6);

    const doseRecords = await this.prisma.doseRecord.findMany({
      where: {
        userId,
        medicationId: { in: medications.map((m) => m.id) },
        scheduledFor: { gte: startDate },
      },
    });
    const takenSet = new Set(
      doseRecords.map((d) => d.scheduledFor.toISOString()),
    );

    let totalScheduled = 0;
    let totalTaken = 0;

    for (let i = 0; i < 7; i += 1) {
      const cursor = new Date(startDate);
      cursor.setDate(cursor.getDate() + i);
      const dateOnly = toDateOnlyString(cursor);
      const dayOfWeek = cursor.getDay();

      const relevant = medications.filter(
        (m) =>
          m.diasSemana.includes(dayOfWeek) &&
          isWithinRange(dateOnly, m.dataInicio, m.dataFim),
      );

      for (const medication of relevant) {
        for (const horario of medication.horarios) {
          const scheduledFor = combineDateAndTime(dateOnly, horario);
          if (scheduledFor > now) continue;

          totalScheduled += 1;
          if (takenSet.has(scheduledFor.toISOString())) totalTaken += 1;
        }
      }
    }

    if (totalScheduled === 0) return null;
    return Math.round((totalTaken / totalScheduled) * 100);
  }

  private async findNextUpcoming(
    userId: string,
    fromDateOnly: string,
    familyMemberId: string | null,
  ): Promise<TimelineItem | null> {
    const medications = await this.prisma.medication.findMany({
      where: { userId, familyMemberId, status: 'ATIVO' },
    });
    if (medications.length === 0) return null;

    const cursor = combineDateAndTime(fromDateOnly, '00:00');

    for (let i = 1; i <= LOOKAHEAD_DAYS; i += 1) {
      const nextDate = new Date(cursor);
      nextDate.setDate(nextDate.getDate() + i);
      const dateOnly = toDateOnlyString(nextDate);
      const dayOfWeek = nextDate.getDay();

      const candidates = medications
        .filter(
          (m) =>
            m.diasSemana.includes(dayOfWeek) &&
            isWithinRange(dateOnly, m.dataInicio, m.dataFim),
        )
        .flatMap((m) =>
          m.horarios.map((horario) => ({
            medicationId: m.id,
            nome: m.nome,
            dosagem: m.dosagem,
            cor: m.cor,
            fotoUrl: m.fotoUrl,
            horario,
            scheduledFor: combineDateAndTime(dateOnly, horario).toISOString(),
            status: 'pendente' as DoseStatus,
          })),
        )
        .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));

      if (candidates.length > 0) {
        return candidates[0];
      }
    }

    return null;
  }

  async getHistorico(
    userId: string,
    familyMemberId: string | null,
    requestedDays: number | undefined,
  ): Promise<HistoricoResult> {
    // O limite de dias vem do plano do usuário — o parâmetro requestedDays
    // do frontend nunca pode ultrapassá-lo.
    const planLimitDays =
      await this.subscriptionsService.getHistoryDaysLimit(userId);
    const effectiveLimit = planLimitDays ?? HISTORY_HARD_CAP_DAYS;
    const days = Math.max(
      1,
      Math.min(requestedDays ?? effectiveLimit, effectiveLimit),
    );

    const now = new Date();
    const today = toDateOnlyString(now);
    const scopeWhere = { userId, familyMemberId };

    const medications = await this.prisma.medication.findMany({
      where: scopeWhere,
    });
    if (medications.length === 0) {
      return { items: [], totalDias: days, limiteDias: planLimitDays };
    }

    const startDate = combineDateAndTime(today, '00:00');
    startDate.setDate(startDate.getDate() - (days - 1));

    const doseRecords = await this.prisma.doseRecord.findMany({
      where: {
        userId,
        medicationId: { in: medications.map((m) => m.id) },
        scheduledFor: { gte: startDate },
      },
    });
    const takenSet = new Set(
      doseRecords.map((d) => d.scheduledFor.toISOString()),
    );

    const items: TimelineItem[] = [];

    for (let i = 0; i < days; i += 1) {
      const cursor = new Date(startDate);
      cursor.setDate(cursor.getDate() + i);
      const dateOnly = toDateOnlyString(cursor);
      const dayOfWeek = cursor.getDay();

      const relevant = medications.filter(
        (m) =>
          m.diasSemana.includes(dayOfWeek) &&
          isWithinRange(dateOnly, m.dataInicio, m.dataFim),
      );

      for (const medication of relevant) {
        for (const horario of medication.horarios) {
          const scheduledFor = combineDateAndTime(dateOnly, horario);
          if (scheduledFor > now) continue;

          const isTaken = takenSet.has(scheduledFor.toISOString());
          const minutesLate = (now.getTime() - scheduledFor.getTime()) / 60000;
          if (!isTaken && minutesLate <= LATE_GRACE_MINUTES) continue;

          const status: DoseStatus = isTaken ? 'tomado' : 'perdido';

          items.push({
            medicationId: medication.id,
            nome: medication.nome,
            dosagem: medication.dosagem,
            cor: medication.cor,
            fotoUrl: medication.fotoUrl,
            horario,
            scheduledFor: scheduledFor.toISOString(),
            status,
          });
        }
      }
    }

    items.sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor));

    return { items, totalDias: days, limiteDias: planLimitDays };
  }
}
