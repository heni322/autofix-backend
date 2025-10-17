import { IsNotEmpty, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CheckAvailabilityDto {
  @ApiProperty({ description: 'Garage ID to check availability', example: 1 })
  @IsNotEmpty({ message: 'Garage ID is required' })
  @IsNumber({}, { message: 'Garage ID must be a number' })
  @Min(1, { message: 'Garage ID must be positive' })
  @Type(() => Number)
  garageId!: number;

  @ApiProperty({ description: 'Service ID to check availability', example: 1 })
  @IsNotEmpty({ message: 'Service ID is required' })
  @IsNumber({}, { message: 'Service ID must be a number' })
  @Min(1, { message: 'Service ID must be positive' })
  @Type(() => Number)
  serviceId!: number;

  @ApiProperty({ description: 'Time slot to check (ISO 8601 format)', example: '2025-10-05T10:00:00Z' })
  @IsNotEmpty({ message: 'Time slot is required' })
  @IsDateString({}, { message: 'Time slot must be a valid date string' })
  timeSlot!: string;
}