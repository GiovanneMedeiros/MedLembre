import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { PaymentsWebhookController } from './payments-webhook.controller';
import { SubscriptionsService } from './subscriptions.service';
import { GenericPaymentProvider } from './providers/generic-payment.provider';
import { PAYMENT_PROVIDER } from './providers/payment-provider.interface';

@Module({
  controllers: [SubscriptionsController, PaymentsWebhookController],
  providers: [
    GenericPaymentProvider,
    { provide: PAYMENT_PROVIDER, useExisting: GenericPaymentProvider },
    SubscriptionsService,
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
