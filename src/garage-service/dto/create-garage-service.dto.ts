import {
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  IsEnum,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PricingType {
  FIXED = 'FIXED',
  QUOTE = 'QUOTE',
  CONSULTATION = 'CONSULTATION',
}

export class CreateGarageServiceDto {
  @ApiProperty({ description: 'Garage ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  garageId!: number;

  @ApiProperty({ description: 'Service ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  serviceId!: number;

  @ApiProperty({ description: 'Service capacity', minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  capacity!: number;

  @ApiPropertyOptional({ description: 'Price (if fixed pricing)', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiProperty({ description: 'Pricing type', enum: PricingType })
  @IsNotEmpty()
  @IsEnum(PricingType)
  pricingType!: PricingType;

  @ApiPropertyOptional({ description: 'Service availability', default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Additional notes about the service' })
  @IsOptional()
  @IsString()
  notes?: string;
}
