import { Module } from '@nestjs/common';
import { SmsModule } from '../sms/sms.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { RemindersScheduler } from './reminders.scheduler';

@Module({
  imports: [WhatsAppModule, SmsModule],
  providers: [RemindersScheduler],
})
export class RemindersModule {}
