import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SendMessageResult, WhatsAppButton, WhatsAppProvider } from './whatsapp-provider.interface';

const GRAPH_API_VERSION = 'v21.0';

@Injectable()
export class MetaWhatsAppProvider implements WhatsAppProvider {
  private readonly logger = new Logger(MetaWhatsAppProvider.name);
  private readonly accessToken?: string;
  private readonly phoneNumberId?: string;

  constructor(private readonly configService: ConfigService) {
    this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN') || undefined;
    this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || undefined;
  }

  isConfigured(): boolean {
    return Boolean(this.accessToken && this.phoneNumberId);
  }

  async sendTextMessage(to: string, body: string): Promise<SendMessageResult> {
    return this.send(to, {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    });
  }

  async sendButtonsMessage(to: string, body: string, buttons: WhatsAppButton[]): Promise<SendMessageResult> {
    return this.send(to, {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: body },
        action: {
          buttons: buttons.map((button) => ({
            type: 'reply',
            reply: { id: button.id, title: button.title },
          })),
        },
      },
    });
  }

  private async send(to: string, payload: Record<string, unknown>): Promise<SendMessageResult> {
    if (!this.isConfigured()) {
      this.logger.warn(
        `[SIMULADO] WhatsApp não configurado (WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID ausentes). Mensagem para ${to} não enviada de verdade.`,
      );
      return { simulated: true };
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json().catch(() => null)) as
        | { messages?: { id: string }[]; error?: { message?: string } }
        | null;

      if (!response.ok) {
        const errorMessage = data?.error?.message ?? `HTTP ${response.status}`;
        this.logger.error(`Falha ao enviar WhatsApp para ${to}: ${errorMessage}`);
        return { simulated: false, errorMessage };
      }

      return { simulated: false, providerMessageId: data?.messages?.[0]?.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro de rede ao enviar WhatsApp para ${to}: ${errorMessage}`);
      return { simulated: false, errorMessage };
    }
  }
}
