import { IsDateString } from 'class-validator';

export class MarkDoseDto {
  @IsDateString({}, { message: 'Informe um horário de dose válido' })
  scheduledFor: string;
}
