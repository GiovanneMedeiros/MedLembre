import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateEmergencyContactDto {
  @IsString()
  @MinLength(2, { message: 'O nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  nome: string;

  @Matches(/^\d{10,11}$/, {
    message: 'Informe um telefone válido, com DDD (somente números)',
  })
  whatsapp: string;
}
