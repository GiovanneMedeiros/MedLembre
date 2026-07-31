import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_ADDRESS = 'MedLembre <naoresponda@medlembre.com.br>';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string | undefined;

  constructor(configService: ConfigService) {
    this.apiKey = configService.get<string>('RESEND_API_KEY');
    if (!this.apiKey) {
      this.logger.warn(
        'RESEND_API_KEY não configurada — envio de e-mails transacionais desativado.',
      );
    }
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.apiKey) return;

    try {
      const res = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        this.logger.error(`Falha ao enviar e-mail para ${to}: ${res.status} ${body}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Falha ao enviar e-mail para ${to}: ${message}`);
    }
  }
}
