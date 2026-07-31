import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';

@Injectable()
export class EmergencyContactsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOneOrThrow(userId: string, id: string) {
    const contact = await this.prisma.emergencyContact.findFirst({
      where: { id, userId },
    });
    if (!contact) {
      throw new NotFoundException('Contato de emergência não encontrado');
    }
    return contact;
  }

  async create(userId: string, dto: CreateEmergencyContactDto) {
    await this.subscriptionsService.assertCanCreateEmergencyContact(userId);

    return this.prisma.emergencyContact.create({
      data: { userId, nome: dto.nome, whatsapp: dto.whatsapp },
    });
  }

  async update(userId: string, id: string, dto: UpdateEmergencyContactDto) {
    const existing = await this.findOneOrThrow(userId, id);

    return this.prisma.emergencyContact.update({
      where: { id: existing.id },
      data: { nome: dto.nome, whatsapp: dto.whatsapp },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOneOrThrow(userId, id);
    await this.prisma.emergencyContact.delete({ where: { id } });
  }
}
