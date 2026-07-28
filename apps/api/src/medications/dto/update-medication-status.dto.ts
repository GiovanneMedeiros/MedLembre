import { IsEnum } from 'class-validator';
import { MedicationStatus } from '@prisma/client';

export class UpdateMedicationStatusDto {
  @IsEnum(MedicationStatus, { message: 'Status inválido' })
  status: MedicationStatus;
}
