import { Module } from '@nestjs/common';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { RemindersScheduler } from './reminders.scheduler';

@Module({
  imports: [WhatsAppModule],
  providers: [RemindersScheduler],
})
export class RemindersModule {}
