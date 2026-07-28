import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { SubscriptionsService } from './subscriptions.service';

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
  async getMine(@CurrentUser() user: AuthenticatedUser) {
    const subscription = await this.subscriptionsService.getOrCreate(user.id);
    const hasFamilyAccess =
      subscription.plano === 'FAMILIA' || subscription.plano === 'PREMIUM';

    return { plano: subscription.plano, hasFamilyAccess };
  }
}
