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

const PROVIDER_NAME = 'cakto';

@Controller('webhooks/payments')
export class PaymentsWebhookController {
  private readonly logger = new Logger(PaymentsWebhookController.name);

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('cakto')
  @HttpCode(HttpStatus.OK)
  async receiveCakto(@Req() req: RawBodyRequest<Request>) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new UnauthorizedException('Corpo da requisição ausente.');
    }

    const query = req.query as Record<string, string | string[] | undefined>;

    const isValid = this.subscriptionsService.verifyWebhookSignature(
      rawBody,
      req.headers,
      query,
    );
    if (!isValid) {
      throw new UnauthorizedException('Assinatura do webhook inválida.');
    }

    const event = this.subscriptionsService.parseWebhookEvent(
      rawBody,
      req.headers,
      query,
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
