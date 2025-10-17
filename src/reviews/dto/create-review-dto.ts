import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  userId!: number;

  @ApiProperty({ description: 'Garage ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  garageId!: number;

  @ApiProperty({ description: 'Rating (1-5)', minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating!: number;

  @ApiPropertyOptional({ description: 'Review comment' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ description: 'Associated reservation ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  reservationId?: number;
}
