import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppWebhookController } from './whatsapp-webhook.controller';
import { MetaWhatsAppProvider } from './providers/meta-whatsapp.provider';
import { WHATSAPP_PROVIDER } from './providers/whatsapp-provider.interface';
import { MedicationsModule } from '../medications/medications.module';

@Module({
  imports: [MedicationsModule],
  controllers: [WhatsAppWebhookController],
  providers: [
    MetaWhatsAppProvider,
    { provide: WHATSAPP_PROVIDER, useExisting: MetaWhatsAppProvider },
    WhatsAppService,
  ],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
