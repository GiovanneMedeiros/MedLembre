import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MedicationStatus, ReminderStatus } from '@prisma/client';
import { NUDGE_INTERVAL_MINUTES } from '../reminders/reminders.scheduler';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

@Injectable()
export class MedicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  private assertValidDateRange(dataInicio?: string, dataFim?: string | null) {
    if (dataInicio && dataFim && new Date(dataFim) < new Date(dataInicio)) {
      throw new BadRequestException(
        'A data de término não pode ser anterior à data de início',
      );
    }
  }

  private async assertFamilyMemberOwnership(
    userId: string,
    familyMemberId?: string,
  ) {
    if (!familyMemberId) return;

    const member = await this.prisma.familyMember.findFirst({
      where: { id: familyMemberId, userId },
    });

    if (!member) {
      throw new NotFoundException('Familiar não encontrado');
    }
  }

  async findAll(userId: string, familyMemberId: string | null) {
    return this.prisma.medication.findMany({
      where: { userId, familyMemberId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneOrThrow(userId: string, id: string) {
    const medication = await this.prisma.medication.findFirst({
      where: { id, userId },
    });

    if (!medication) {
      throw new NotFoundException('Medicamento não encontrado');
    }

    return medication;
  }

  async create(userId: string, dto: CreateMedicationDto) {
    this.assertValidDateRange(dto.dataInicio, dto.dataFim);
    await this.assertFamilyMemberOwnership(userId, dto.familyMemberId);
    await this.subscriptionsService.assertCanCreateMedication(userId);

    return this.prisma.medication.create({
      data: {
        userId,
        familyMemberId: dto.familyMemberId,
        nome: dto.nome,
        dosagem: dto.dosagem,
        observacao: dto.observacao,
        horarios: dto.horarios,
        diasSemana: dto.diasSemana,
        dataInicio: new Date(dto.dataInicio),
        dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateMedicationDto) {
    const existing = await this.findOneOrThrow(userId, id);

    const dataInicio = dto.dataInicio ?? existing.dataInicio.toISOString();
    const dataFim =
      dto.dataFim ?? (existing.dataFim ? existing.dataFim.toISOString() : null);
    this.assertValidDateRange(dataInicio, dataFim);

    return this.prisma.medication.update({
      where: { id: existing.id },
      data: {
        nome: dto.nome,
        dosagem: dto.dosagem,
        observacao: dto.observacao,
        horarios: dto.horarios,
        diasSemana: dto.diasSemana,
        dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
        dataFim:
          dto.dataFim !== undefined
            ? dto.dataFim
              ? new Date(dto.dataFim)
              : null
            : undefined,
      },
    });
  }

  async updateStatus(userId: string, id: string, status: MedicationStatus) {
    await this.findOneOrThrow(userId, id);

    return this.prisma.medication.update({
      where: { id },
      data: { status },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOneOrThrow(userId, id);
    await this.prisma.medication.delete({ where: { id } });
  }

  async markDoseTaken(
    userId: string,
    medicationId: string,
    scheduledFor: string,
  ) {
    await this.findOneOrThrow(userId, medicationId);

    return this.prisma.doseRecord.upsert({
      where: {
        medicationId_scheduledFor: {
          medicationId,
          scheduledFor: new Date(scheduledFor),
        },
      },
      create: {
        medicationId,
        userId,
        scheduledFor: new Date(scheduledFor),
      },
      update: {},
    });
  }

  async unmarkDose(userId: string, medicationId: string, scheduledFor: string) {
    await this.findOneOrThrow(userId, medicationId);

    await this.prisma.doseRecord.deleteMany({
      where: {
        medicationId,
        userId,
        scheduledFor: new Date(scheduledFor),
      },
    });
  }

  /**
   * "+5min": adia o próximo lembrete dessa dose. O agendador (reminders
   * scheduler) já reinsiste sozinho a cada NUDGE_INTERVAL_MINUTES enquanto a
   * dose seguir sem resposta — este endpoint só permite o usuário pedir isso
   * manualmente pelo dashboard, com o mesmo intervalo.
   */
  async snoozeDose(userId: string, medicationId: string, scheduledFor: string) {
    const medication = await this.findOneOrThrow(userId, medicationId);
    const scheduledForDate = new Date(scheduledFor);
    const snoozedUntil = new Date(
      Date.now() + NUDGE_INTERVAL_MINUTES * 60 * 1000,
    );

    await this.prisma.reminderLog.upsert({
      where: {
        medicationId_scheduledFor: {
          medicationId: medication.id,
          scheduledFor: scheduledForDate,
        },
      },
      create: {
        userId,
        medicationId: medication.id,
        familyMemberId: medication.familyMemberId,
        scheduledFor: scheduledForDate,
        status: ReminderStatus.SIMULADO,
        snoozedUntil,
      },
      update: { snoozedUntil },
    });

    return { snoozedUntil };
  }
}
