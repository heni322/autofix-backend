import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @ApiPropertyOptional({ description: 'User ID making the reservation (set automatically from JWT)' })
  @IsOptional()
  @IsNumber({}, { message: 'User ID must be a number' })
  @Min(1, { message: 'User ID must be positive' })
  @Type(() => Number)
  userId?: number;

  @ApiProperty({ description: 'Garage ID for the reservation' })
  @IsNotEmpty({ message: 'Garage ID is required' })
  @IsNumber({}, { message: 'Garage ID must be a number' })
  @Min(1, { message: 'Garage ID must be positive' })
  @Type(() => Number)
  garageId!: number;

  @ApiProperty({ description: 'Service ID to be performed' })
  @IsNotEmpty({ message: 'Service ID is required' })
  @IsNumber({}, { message: 'Service ID must be a number' })
  @Min(1, { message: 'Service ID must be positive' })
  @Type(() => Number)
  serviceId!: number;

  @ApiProperty({ description: 'Time slot for the reservation (ISO 8601 format)', example: '2025-10-05T10:00:00Z' })
  @IsNotEmpty({ message: 'Time slot is required' })
  @IsDateString({}, { message: 'Time slot must be a valid date string' })
  timeSlot!: string;

  @ApiPropertyOptional({ description: 'Additional notes from the client' })
  @IsOptional()
  @IsString({ message: 'Client notes must be a string' })
  clientNotes?: string;
}
