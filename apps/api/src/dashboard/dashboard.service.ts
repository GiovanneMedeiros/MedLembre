import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { DashboardSummary, DoseStatus, TimelineItem } from './dashboard.types';

const LATE_GRACE_MINUTES = 30;
const LOOKAHEAD_DAYS = 7;

function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function combineDateAndTime(dateOnly: string, horario: string): Date {
  return new Date(`${dateOnly}T${horario}:00`);
}

function isWithinRange(dateOnly: string, dataInicio: Date, dataFim: Date | null): boolean {
  const target = combineDateAndTime(dateOnly, '00:00');
  if (target < new Date(toDateOnlyString(dataInicio) + 'T00:00:00')) return false;
  if (dataFim && target > new Date(toDateOnlyString(dataFim) + 'T23:59:59')) return false;
  return true;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string, dateOnly?: string): Promise<DashboardSummary> {
    const today = dateOnly ?? toDateOnlyString(new Date());
    const now = new Date();

    const [medications, totalCount] = await Promise.all([
      this.prisma.medication.findMany({ where: { userId, status: 'ATIVO' } }),
      this.prisma.medication.count({ where: { userId } }),
    ]);

    const dayOfWeek = combineDateAndTime(today, '00:00').getDay();

    const relevantMedications = medications.filter(
      (m) => m.diasSemana.includes(dayOfWeek) && isWithinRange(today, m.dataInicio, m.dataFim),
    );

    const doseRecordsToday = await this.prisma.doseRecord.findMany({
      where: {
        userId,
        scheduledFor: {
          gte: combineDateAndTime(today, '00:00'),
          lt: combineDateAndTime(today, '23:59'),
        },
      },
    });

    const takenSet = new Set(doseRecordsToday.map((d) => d.scheduledFor.toISOString()));

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
          horario,
          scheduledFor: scheduledFor.toISOString(),
          status,
        });
      }
    }

    timelineHoje.sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));

    const nextPendingIndex = timelineHoje.findIndex((item) => item.status === 'pendente');
    if (nextPendingIndex !== -1) {
      timelineHoje[nextPendingIndex] = { ...timelineHoje[nextPendingIndex], status: 'proximo' };
    }

    let proximoMedicamento = timelineHoje.find((item) => item.status === 'proximo') ?? null;

    if (!proximoMedicamento) {
      proximoMedicamento = await this.findNextUpcoming(userId, today);
    }

    const medicamentosTomadosHoje = timelineHoje.filter((item) => item.status === 'tomado').length;
    const lembretesPendentesHoje = timelineHoje.filter((item) =>
      ['pendente', 'proximo', 'atrasado'].includes(item.status),
    ).length;

    return {
      medicamentosCadastrados: totalCount,
      medicamentosTomadosHoje,
      lembretesPendentesHoje,
      proximoMedicamento,
      timelineHoje,
    };
  }

  private async findNextUpcoming(userId: string, fromDateOnly: string): Promise<TimelineItem | null> {
    const medications = await this.prisma.medication.findMany({ where: { userId, status: 'ATIVO' } });
    if (medications.length === 0) return null;

    let cursor = combineDateAndTime(fromDateOnly, '00:00');

    for (let i = 1; i <= LOOKAHEAD_DAYS; i += 1) {
      const nextDate = new Date(cursor);
      nextDate.setDate(nextDate.getDate() + i);
      const dateOnly = toDateOnlyString(nextDate);
      const dayOfWeek = nextDate.getDay();

      const candidates = medications
        .filter((m) => m.diasSemana.includes(dayOfWeek) && isWithinRange(dateOnly, m.dataInicio, m.dataFim))
        .flatMap((m) =>
          m.horarios.map((horario) => ({
            medicationId: m.id,
            nome: m.nome,
            dosagem: m.dosagem,
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
}
