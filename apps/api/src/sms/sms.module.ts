import { Module } from '@nestjs/common';
import { SMS_PROVIDER } from './providers/sms-provider.interface';
import { TwilioSmsProvider } from './providers/twilio-sms.provider';
import { SmsService } from './sms.service';

@Module({
  providers: [TwilioSmsProvider, { provide: SMS_PROVIDER, useExisting: TwilioSmsProvider }, SmsService],
  exports: [SmsService],
})
export class SmsModule {}
