import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseUUIDPipe,
  Query,
  ParseIntPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  Notification,
  NotificationType,
} from '../entities/notification.entity';
import { NotificationService, NotificationStats } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification-dto';
import { UpdateNotificationDto } from './dto/update-notification-dto';
import { BulkMarkAsReadDto } from './dto/bulk-mark-as-read-dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return await this.notificationService.create(createNotificationDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async createBulk(
    @Body(ValidationPipe) createNotificationDtos: CreateNotificationDto[],
  ): Promise<Notification[]> {
    return await this.notificationService.createBulk(createNotificationDtos);
  }

  @Get()
  async findAll(): Promise<Notification[]> {
    return await this.notificationService.findAll();
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Notification[]> {
    return await this.notificationService.findByUser(userId);
  }

  @Get('user/:userId/unread')
  async findUnreadByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Notification[]> {
    return await this.notificationService.findUnreadByUser(userId);
  }

  @Get('user/:userId/count')
  async getUnreadCount(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Get('user/:userId/stats')
  async getUserStats(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<NotificationStats> {
    return await this.notificationService.getUserStats(userId);
  }

  @Get('user/:userId/recent')
  async getRecentNotifications(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<Notification[]> {
    return await this.notificationService.getRecentNotifications(userId, limit);
  }

  @Get('user/:userId/type/:type')
  async findByUserAndType(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('type', new ParseEnumPipe(NotificationType)) type: NotificationType,
  ): Promise<Notification[]> {
    return await this.notificationService.findByUserAndType(userId, type);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Notification> {
    return await this.notificationService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateNotificationDto: UpdateNotificationDto,
    @Body('userId', ParseIntPipe) userId: number,
  ): Promise<Notification> {
    return await this.notificationService.update(
      id,
      userId,
      updateNotificationDto,
    );
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userId', ParseIntPipe) userId: number,
  ): Promise<Notification> {
    return await this.notificationService.markAsRead(id, userId);
  }

  @Patch(':id/unread')
  async markAsUnread(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userId', ParseIntPipe) userId: number,
  ): Promise<Notification> {
    return await this.notificationService.markAsUnread(id, userId);
  }

  @Patch('user/:userId/read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllAsRead(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    return await this.notificationService.markAllAsRead(userId);
  }

  @Patch('bulk/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markMultipleAsRead(
    @Body(ValidationPipe) bulkMarkAsReadDto: BulkMarkAsReadDto,
    @Body('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    return await this.notificationService.markMultipleAsRead(
      bulkMarkAsReadDto.notificationIds,
      userId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    return await this.notificationService.remove(id, userId);
  }

  @Delete('user/:userId/all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAll(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    return await this.notificationService.removeAll(userId);
  }

  @Delete('user/:userId/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeRead(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    return await this.notificationService.removeRead(userId);
  }

  // Helper endpoints for sending specific notification types
  @Post('send/reservation-confirmed')
  @HttpCode(HttpStatus.CREATED)
  async sendReservationConfirmed(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('reservationId') reservationId: string,
    @Body('metadata') metadata?: any,
  ): Promise<Notification> {
    return await this.notificationService.sendReservationConfirmed(
      userId,
      reservationId,
      metadata,
    );
  }

  @Post('send/reservation-cancelled')
  @HttpCode(HttpStatus.CREATED)
  async sendReservationCancelled(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('reservationId') reservationId: string,
    @Body('metadata') metadata?: any,
  ): Promise<Notification> {
    return await this.notificationService.sendReservationCancelled(
      userId,
      reservationId,
      metadata,
    );
  }

  @Post('send/quote-provided')
  @HttpCode(HttpStatus.CREATED)
  async sendQuoteProvided(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('quoteId') quoteId: string,
    @Body('metadata') metadata?: any,
  ): Promise<Notification> {
    return await this.notificationService.sendQuoteProvided(
      userId,
      quoteId,
      metadata,
    );
  }

  @Post('send/reminder')
  @HttpCode(HttpStatus.CREATED)
  async sendReminder(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('message') message: string,
    @Body('metadata') metadata?: any,
  ): Promise<Notification> {
    return await this.notificationService.sendReminder(
      userId,
      message,
      metadata,
    );
  }

  @Post('send/review-request')
  @HttpCode(HttpStatus.CREATED)
  async sendReviewRequest(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('reservationId') reservationId: string,
    @Body('metadata') metadata?: any,
  ): Promise<Notification> {
    return await this.notificationService.sendReviewRequest(
      userId,
      reservationId,
      metadata,
    );
  }
}
