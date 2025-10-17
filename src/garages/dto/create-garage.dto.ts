import { IsNotEmpty, IsString, IsOptional, IsEmail, IsUrl, IsNumber, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateGarageDto {
  @ApiProperty({ example: 'Garage Auto Pro' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Garage spécialisé en mécanique générale' })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({ example: '123 Avenue de la République' })
  @IsNotEmpty()
  @IsString()
  address!: string;

  @ApiProperty({ example: 'Tunis' })
  @IsNotEmpty()
  @IsString()
  city!: string;

  @ApiProperty({ example: '1000' })
  @IsNotEmpty()
  @IsString()
  postalCode!: string;

  @ApiPropertyOptional({ example: 36.8065 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ example: 10.1815 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @ApiProperty({ example: '+216 12345678' })
  @IsNotEmpty()
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ example: 'contact@garage.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'https://www.mongarage.com' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ 
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    description: 'Array of image URLs'
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    example: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '08:00', close: '14:00' },
      sunday: { open: 'closed', close: 'closed' }
    },
    description: 'Opening hours for each day of the week'
  })
  @IsObject()
  @IsOptional()
  openingHours?: Record<string, { open: string; close: string }>;
}
