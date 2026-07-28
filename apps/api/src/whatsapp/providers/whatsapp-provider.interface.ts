import type { SendMessageResult } from '../../common/notification.types';

export type { SendMessageResult };

export interface WhatsAppButton {
  id: string;
  title: string;
}

export const WHATSAPP_PROVIDER = Symbol('WHATSAPP_PROVIDER');

export interface WhatsAppProvider {
  isConfigured(): boolean;
  sendTextMessage(to: string, body: string): Promise<SendMessageResult>;
  sendButtonsMessage(
    to: string,
    body: string,
    buttons: WhatsAppButton[],
  ): Promise<SendMessageResult>;
}
