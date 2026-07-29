import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { SubscriptionsService } from './subscriptions.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly configService: ConfigService,
  ) {}

  @Get('me')
  async getMine(@CurrentUser() user: AuthenticatedUser) {
    const subscription = await this.subscriptionsService.getOrCreate(user.id);
    const hasFamilyAccess =
      subscription.plano === 'FAMILIA' || subscription.plano === 'PREMIUM';

    return {
      plano: subscription.plano,
      status: subscription.status,
      periodicidade: subscription.periodicidade,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      hasFamilyAccess,
      trialExpiresAt: this.subscriptionsService.trialExpiresAt(subscription),
      trialExpired: this.subscriptionsService.isTrialExpired(subscription),
    };
  }

  @Post('checkout')
  async checkout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCheckoutDto,
  ) {
    if (!user.email) {
      throw new BadRequestException(
        'Sua conta não possui um e-mail cadastrado.',
      );
    }

    const webOrigin = (
      this.configService.get<string>('WEB_ORIGIN') ?? 'http://localhost:5173'
    ).split(',')[0];

    return this.subscriptionsService.createCheckoutSession(
      user.id,
      user.email,
      dto.plano,
      dto.periodicidade,
      webOrigin,
    );
  }

  @Post('cancel')
  async cancel(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.cancelSubscription(user.id);
  }
}
