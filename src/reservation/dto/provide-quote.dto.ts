import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProvideQuoteDto {
  @ApiProperty({ description: 'Quote price for the service', example: 150.00 })
  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  @Type(() => Number)
  price!: number;

  @ApiPropertyOptional({ description: 'Additional notes from the garage' })
  @IsOptional()
  @IsString({ message: 'Garage notes must be a string' })
  garageNotes?: string;
}