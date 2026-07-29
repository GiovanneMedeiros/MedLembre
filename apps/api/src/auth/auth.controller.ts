import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseAdminService } from '../supabase-admin/supabase-admin.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './types/authenticated-user';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAdmin: SupabaseAdminService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }

  /**
   * Exclui a conta e todos os dados pessoais do usuário (medicamentos,
   * doses, familiares, push, assinatura). PaymentEvent é preservado como
   * trilha de auditoria financeira, sem dados pessoais além do userId
   * (que passa a não referenciar mais ninguém).
   */
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.medication.deleteMany({ where: { userId: user.id } }),
      this.prisma.familyMember.deleteMany({ where: { userId: user.id } }),
      this.prisma.pushSubscription.deleteMany({ where: { userId: user.id } }),
      this.prisma.subscription.deleteMany({ where: { userId: user.id } }),
    ]);

    await this.supabaseAdmin.deleteUser(user.id);
    this.logger.log(`Conta ${user.id} excluída a pedido do usuário.`);
  }
}
