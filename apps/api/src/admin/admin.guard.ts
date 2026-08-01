import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';

// Aplicado sempre DEPOIS do JwtAuthGuard (que popula req.user) — restringe
// o acesso a uma lista de e-mails configurada via env, sem depender de
// nenhum flag no banco. Simples de propósito: só o dono da conta acessa.
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;

    const adminEmails = (this.configService.get<string>('ADMIN_EMAILS') ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    if (!user?.email || !adminEmails.includes(user.email.toLowerCase())) {
      throw new ForbiddenException('Acesso restrito à administração.');
    }

    return true;
  }
}
