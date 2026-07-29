import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { PaymentsWebhookController } from './payments-webhook.controller';
import { SubscriptionsService } from './subscriptions.service';
import { CaktoPaymentProvider } from './providers/cakto-payment.provider';
import { PAYMENT_PROVIDER } from './providers/payment-provider.interface';

@Module({
  controllers: [SubscriptionsController, PaymentsWebhookController],
  providers: [
    CaktoPaymentProvider,
    { provide: PAYMENT_PROVIDER, useExisting: CaktoPaymentProvider },
    SubscriptionsService,
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
