import { Module } from '@nestjs/common';
import { PushModule } from '../push/push.module';
import { SmsModule } from '../sms/sms.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { RemindersScheduler } from './reminders.scheduler';

@Module({
  imports: [WhatsAppModule, SmsModule, PushModule],
  providers: [RemindersScheduler],
})
export class RemindersModule {}
