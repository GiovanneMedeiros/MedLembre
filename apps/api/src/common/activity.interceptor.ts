import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Request } from 'express';
import type { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';

const THROTTLE_MS = 60_000;

// Registra a última atividade de cada usuário autenticado, usada pelo
// painel /adm pra estimar "quantos estão online agora". Escreve no banco
// no máximo 1x por minuto por usuário (cache em memória) — em requisições
// normais isso significa a maioria delas não bate no banco.
@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  private readonly lastWrite = new Map<string, number>();

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;

    if (user?.id) {
      const now = Date.now();
      const last = this.lastWrite.get(user.id) ?? 0;
      if (now - last > THROTTLE_MS) {
        this.lastWrite.set(user.id, now);
        this.prisma.userActivity
          .upsert({
            where: { userId: user.id },
            create: { userId: user.id, lastSeenAt: new Date() },
            update: { lastSeenAt: new Date() },
          })
          .catch(() => {
            // Não deixa uma falha de telemetria derrubar a requisição real.
          });
      }
    }

    return next.handle();
  }
}
