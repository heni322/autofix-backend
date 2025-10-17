import { IsNotEmpty, IsNumber, IsBoolean, IsOptional, Min, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PricingType } from '../../common/enums/pricing-type.enum';

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

  @ApiProperty({ description: 'Service capacity (concurrent bookings)', minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  capacity!: number;

  @ApiPropertyOptional({ description: 'Price (for fixed pricing)', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiProperty({ description: 'Pricing type', enum: PricingType })
  @IsNotEmpty()
  @IsEnum(PricingType)
  pricingType!: PricingType;

  @ApiPropertyOptional({ description: 'Service availability status', default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
