import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto';

const FAMILY_PLAN_ERROR =
  'A gestão de familiares está disponível apenas nos planos Família e Premium.';

@Injectable()
export class FamilyMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.familyMember.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOneOrThrow(userId: string, id: string) {
    const member = await this.prisma.familyMember.findFirst({ where: { id, userId } });
    if (!member) {
      throw new NotFoundException('Familiar não encontrado');
    }
    return member;
  }

  async create(userId: string, dto: CreateFamilyMemberDto) {
    const hasAccess = await this.subscriptionsService.hasAccessToFamily(userId);
    if (!hasAccess) {
      throw new ForbiddenException(FAMILY_PLAN_ERROR);
    }

    return this.prisma.familyMember.create({
      data: {
        userId,
        nome: dto.nome,
        whatsapp: dto.whatsapp,
        fotoUrl: dto.fotoUrl,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateFamilyMemberDto) {
    const existing = await this.findOneOrThrow(userId, id);

    return this.prisma.familyMember.update({
      where: { id: existing.id },
      data: {
        nome: dto.nome,
        whatsapp: dto.whatsapp,
        fotoUrl: dto.fotoUrl,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOneOrThrow(userId, id);
    await this.prisma.familyMember.delete({ where: { id } });
  }
}
