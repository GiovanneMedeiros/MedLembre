import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Max,
  Min,
  MinLength,
} from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateMedicationDto {
  @IsOptional()
  @IsUUID(undefined, { message: 'Familiar inválido' })
  familyMemberId?: string;

  @IsString()
  @MinLength(2, { message: 'O nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  nome: string;

  @IsString()
  @MinLength(1, { message: 'Informe a dosagem' })
  @MaxLength(50, { message: 'A dosagem deve ter no máximo 50 caracteres' })
  dosagem: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'A observação deve ter no máximo 500 caracteres' })
  observacao?: string;

  @IsArray({ message: 'Informe ao menos um horário' })
  @ArrayMinSize(1, { message: 'Informe ao menos um horário' })
  @ArrayUnique({ message: 'Os horários não podem se repetir' })
  @Matches(TIME_PATTERN, {
    each: true,
    message: 'Cada horário deve estar no formato HH:mm',
  })
  horarios: string[];

  @IsArray({ message: 'Selecione ao menos um dia da semana' })
  @ArrayMinSize(1, { message: 'Selecione ao menos um dia da semana' })
  @ArrayUnique({ message: 'Os dias da semana não podem se repetir' })
  @IsInt({ each: true })
  @Min(0, { each: true, message: 'Dia da semana inválido' })
  @Max(6, { each: true, message: 'Dia da semana inválido' })
  diasSemana: number[];

  @IsDateString({}, { message: 'Informe uma data de início válida' })
  dataInicio: string;

  @IsOptional()
  @IsDateString({}, { message: 'Informe uma data de término válida' })
  dataFim?: string;
}
