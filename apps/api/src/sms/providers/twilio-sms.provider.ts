import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { toE164BR } from '../../common/phone.util';
import type { SendMessageResult, SmsProvider } from './sms-provider.interface';

const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01';

@Injectable()
export class TwilioSmsProvider implements SmsProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);
  private readonly accountSid?: string;
  private readonly authToken?: string;
  private readonly fromNumber?: string;

  constructor(configService: ConfigService) {
    this.accountSid = configService.get<string>('TWILIO_ACCOUNT_SID') || undefined;
    this.authToken = configService.get<string>('TWILIO_AUTH_TOKEN') || undefined;
    this.fromNumber = configService.get<string>('TWILIO_FROM_NUMBER') || undefined;
  }

  isConfigured(): boolean {
    return Boolean(this.accountSid && this.authToken && this.fromNumber);
  }

  async sendTextMessage(to: string, body: string): Promise<SendMessageResult> {
    if (!this.isConfigured()) {
      this.logger.warn(
        `[SIMULADO] SMS não configurado (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM_NUMBER ausentes). Mensagem para ${to} não enviada de verdade.`,
      );
      return { simulated: true };
    }

    const toNumber = toE164BR(to);

    try {
      const response = await fetch(`${TWILIO_API_BASE}/Accounts/${this.accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: this.fromNumber as string,
          To: toNumber,
          Body: body,
        }).toString(),
      });

      const data = (await response.json().catch(() => null)) as
        | { sid?: string; message?: string; error_message?: string }
        | null;

      if (!response.ok) {
        const errorMessage = data?.message ?? data?.error_message ?? `HTTP ${response.status}`;
        this.logger.error(`Falha ao enviar SMS para ${toNumber}: ${errorMessage}`);
        return { simulated: false, errorMessage };
      }

      return { simulated: false, providerMessageId: data?.sid };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro de rede ao enviar SMS para ${toNumber}: ${errorMessage}`);
      return { simulated: false, errorMessage };
    }
  }
}
