import { BillingPeriod, Plano } from '@prisma/client';
import { IsEnum, IsIn } from 'class-validator';

const UPGRADABLE_PLANS = [
  Plano.ESSENCIAL,
  Plano.FAMILIA,
  Plano.PREMIUM,
] as const;

export class CreateCheckoutDto {
  @IsIn(UPGRADABLE_PLANS, { message: 'Plano inválido para assinatura' })
  plano: Plano;

  @IsEnum(BillingPeriod, { message: 'Periodicidade inválida' })
  periodicidade: BillingPeriod;
}
