import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  type RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { MedicationsService } from '../medications/medications.service';
import { WhatsAppService } from './whatsapp.service';
import { decodeButtonId, type DecodedButtonId } from './templates/message-templates';

interface IncomingMessage {
  from?: string;
  type?: string;
  interactive?: {
    type?: string;
    button_reply?: { id?: string; title?: string };
  };
}

interface WhatsAppWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: { messages?: IncomingMessage[] };
    }>;
  }>;
}

@Controller('webhooks/whatsapp')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly medicationsService: MedicationsService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  @Get()
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const expected = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN');

    if (mode === 'subscribe' && expected && token === expected) {
      return res.status(HttpStatus.OK).send(challenge);
    }

    return res.status(HttpStatus.FORBIDDEN).send('Token de verificação inválido');
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async receive(@Req() req: RawBodyRequest<Request>, @Body() payload: WhatsAppWebhookPayload) {
    this.assertValidSignature(req);

    const messages =
      payload.entry?.flatMap((entry) => entry.changes ?? []).flatMap((change) => change.value?.messages ?? []) ?? [];

    for (const message of messages) {
      const buttonReply = message.interactive?.button_reply;
      if (!buttonReply?.id || !message.from) continue;

      const decoded = decodeButtonId(buttonReply.id);
      if (!decoded) continue;

      await this.handleButtonReply(decoded, message.from);
    }

    return { received: true };
  }

  private assertValidSignature(req: RawBodyRequest<Request>) {
    const appSecret = this.configService.get<string>('WHATSAPP_APP_SECRET');
    if (!appSecret) {
      this.logger.warn('WHATSAPP_APP_SECRET não configurado — assinatura do webhook não verificada.');
      return;
    }

    const signatureHeader = req.headers['x-hub-signature-256'];
    const rawBody = req.rawBody;

    if (typeof signatureHeader !== 'string' || !rawBody) {
      throw new UnauthorizedException('Assinatura do webhook ausente');
    }

    const expectedSignature = `sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;
    const isValid =
      signatureHeader.length === expectedSignature.length &&
      timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expectedSignature));

    if (!isValid) {
      throw new UnauthorizedException('Assinatura do webhook inválida');
    }
  }

  private async handleButtonReply(decoded: DecodedButtonId, from: string) {
    const medication = await this.prisma.medication.findUnique({ where: { id: decoded.medicationId } });
    if (!medication) {
      this.logger.warn(`Medicamento ${decoded.medicationId} não encontrado para resposta de webhook.`);
      return;
    }

    if (decoded.action === 'TOMEI') {
      await this.medicationsService.markDoseTaken(medication.userId, medication.id, decoded.scheduledFor);
      await this.whatsappService.sendMedicationConfirmation(from, medication.nome);
      this.logger.log(`Dose confirmada via WhatsApp: ${medication.nome} (${decoded.scheduledFor})`);
      return;
    }

    if (decoded.action === 'SNOOZE') {
      await this.prisma.reminderLog.updateMany({
        where: { medicationId: medication.id, scheduledFor: new Date(decoded.scheduledFor) },
        data: { snoozedUntil: new Date(Date.now() + 10 * 60_000) },
      });
      await this.whatsappService.sendMedicationSnooze(from, medication.nome, 10);
      this.logger.log(`Lembrete adiado via WhatsApp: ${medication.nome} (${decoded.scheduledFor})`);
    }
  }
}
