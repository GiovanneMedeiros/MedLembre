export interface WhatsAppButton {
  id: string;
  title: string;
}

export interface SendMessageResult {
  simulated: boolean;
  providerMessageId?: string;
  errorMessage?: string;
}

export const WHATSAPP_PROVIDER = Symbol('WHATSAPP_PROVIDER');

export interface WhatsAppProvider {
  sendTextMessage(to: string, body: string): Promise<SendMessageResult>;
  sendButtonsMessage(to: string, body: string, buttons: WhatsAppButton[]): Promise<SendMessageResult>;
}
