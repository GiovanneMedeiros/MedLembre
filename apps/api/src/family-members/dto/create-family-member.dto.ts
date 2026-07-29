import {
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateFamilyMemberDto {
  @IsString()
  @MinLength(2, { message: 'O nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  nome: string;

  @IsOptional()
  @Matches(/^\d{10,11}$/, {
    message: 'Informe um telefone válido, com DDD (somente números)',
  })
  whatsapp?: string;

  @IsOptional()
  @IsUrl({}, { message: 'URL da foto inválida' })
  fotoUrl?: string;
}
