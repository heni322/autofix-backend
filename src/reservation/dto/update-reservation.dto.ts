import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus } from '../../common/enums/reservation-status.enum';

export class UpdateReservationDto {
  @ApiPropertyOptional({
    description: 'Reservation status',
    enum: ReservationStatus,
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({ description: 'Notes from client' })
  @IsOptional()
  @IsString()
  clientNotes?: string;

  @ApiPropertyOptional({ description: 'Notes from garage' })
  @IsOptional()
  @IsString()
  garageNotes?: string;
}
