import { IsNotEmpty, IsString, IsEnum, IsNumber, IsOptional, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '../../entities/notification.entity';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  userId!: number;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  message!: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}