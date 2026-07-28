import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { UpdateMedicationStatusDto } from './dto/update-medication-status.dto';
import { MarkDoseDto } from './dto/mark-dose.dto';

@UseGuards(JwtAuthGuard)
@Controller('medications')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('familyMemberId') familyMemberId?: string,
  ) {
    return this.medicationsService.findAll(user.id, familyMemberId ?? null);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.medicationsService.findOneOrThrow(user.id, id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMedicationDto,
  ) {
    return this.medicationsService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateMedicationDto,
  ) {
    return this.medicationsService.update(user.id, id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateMedicationStatusDto,
  ) {
    return this.medicationsService.updateStatus(user.id, id, dto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.medicationsService.remove(user.id, id);
  }

  @Post(':id/doses')
  markDose(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: MarkDoseDto,
  ) {
    return this.medicationsService.markDoseTaken(user.id, id, dto.scheduledFor);
  }

  @Delete(':id/doses')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unmarkDose(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query('scheduledFor') scheduledFor: string,
  ) {
    await this.medicationsService.unmarkDose(user.id, id, scheduledFor);
  }
}
