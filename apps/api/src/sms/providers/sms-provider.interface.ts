import type { SendMessageResult } from '../../common/notification.types';

export type { SendMessageResult };

export const SMS_PROVIDER = Symbol('SMS_PROVIDER');

export interface SmsProvider {
  isConfigured(): boolean;
  sendTextMessage(to: string, body: string): Promise<SendMessageResult>;
}
