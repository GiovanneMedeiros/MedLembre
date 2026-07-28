import {
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  UnauthorizedException,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';

const PROVIDER_NAME = 'generic';

@Controller('webhooks/payments')
export class PaymentsWebhookController {
  private readonly logger = new Logger(PaymentsWebhookController.name);

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async receive(@Req() req: RawBodyRequest<Request>) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new UnauthorizedException('Corpo da requisição ausente.');
    }

    const isValid = this.subscriptionsService.verifyWebhookSignature(
      rawBody,
      req.headers,
    );
    if (!isValid) {
      throw new UnauthorizedException('Assinatura do webhook inválida.');
    }

    const event = this.subscriptionsService.parseWebhookEvent(
      rawBody,
      req.headers,
    );
    const result = await this.subscriptionsService.processWebhookEvent(
      PROVIDER_NAME,
      event,
    );

    this.logger.log(
      `Webhook de pagamento ${event.providerEventId} (${event.type}): ${result}`,
    );

    return { received: true };
  }
}
