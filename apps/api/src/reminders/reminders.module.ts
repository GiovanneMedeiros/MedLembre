import { Module } from '@nestjs/common';
import { PushModule } from '../push/push.module';
import { SmsModule } from '../sms/sms.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { RemindersScheduler } from './reminders.scheduler';

@Module({
  imports: [WhatsAppModule, SmsModule, PushModule, SubscriptionsModule],
  providers: [RemindersScheduler],
})
export class RemindersModule {}
