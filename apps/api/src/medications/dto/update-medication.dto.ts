import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateMedicationDto } from './create-medication.dto';

// familyMemberId não pode ser reatribuído via update — o serviço já
// ignora esse campo aqui, mas removê-lo do DTO evita que ele apareça
// como aceito na validação/documentação da API.
export class UpdateMedicationDto extends PartialType(
  OmitType(CreateMedicationDto, ['familyMemberId'] as const),
) {}
