import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification-dto';
import { UpdateNotificationDto } from './dto/update-notification-dto';


export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: Record<NotificationType, number>;
}


@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  async createBulk(createNotificationDtos: CreateNotificationDto[]): Promise<Notification[]> {
    const notifications = this.notificationRepository.create(createNotificationDtos);
    return await this.notificationRepository.save(notifications);
  }

  async findAll(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async findByUser(userId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findUnreadByUser(userId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { userId, isRead: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserAndType(userId: number, type: NotificationType): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { userId, type },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, userId: number, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);

    // Check if user owns this notification
    if (notification.userId !== userId) {
      throw new ForbiddenException('You can only update your own notifications');
    }

    Object.assign(notification, updateNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  async markAsRead(id: string, userId: number): Promise<Notification> {
    const notification = await this.findOne(id);

    if (notification.userId !== userId) {
      throw new ForbiddenException('You can only mark your own notifications as read');
    }

    notification.isRead = true;
    return await this.notificationRepository.save(notification);
  }

  async markAsUnread(id: string, userId: number): Promise<Notification> {
    const notification = await this.findOne(id);

    if (notification.userId !== userId) {
      throw new ForbiddenException('You can only mark your own notifications as unread');
    }

    notification.isRead = false;
    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async markMultipleAsRead(notificationIds: string[], userId: number): Promise<void> {
    const notifications = await this.notificationRepository.find({
      where: { id: In(notificationIds) },
    });

    // Verify all notifications belong to the user
    const allBelongToUser = notifications.every(n => n.userId === userId);
    if (!allBelongToUser) {
      throw new ForbiddenException('You can only mark your own notifications as read');
    }

    await this.notificationRepository.update(
      { id: In(notificationIds) },
      { isRead: true },
    );
  }

  async remove(id: string, userId: number): Promise<void> {
    const notification = await this.findOne(id);

    if (notification.userId !== userId) {
      throw new ForbiddenException('You can only delete your own notifications');
    }

    await this.notificationRepository.remove(notification);
  }

  async removeAll(userId: number): Promise<void> {
    await this.notificationRepository.delete({ userId });
  }

  async removeRead(userId: number): Promise<void> {
    await this.notificationRepository.delete({ userId, isRead: true });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async getUserStats(userId: number): Promise<NotificationStats> {
    const notifications = await this.findByUser(userId);

    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const read = total - unread;

    const byType = notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {} as Record<NotificationType, number>);

    // Initialize all notification types with 0
    Object.values(NotificationType).forEach(type => {
      if (!byType[type]) {
        byType[type] = 0;
      }
    });

    return { total, unread, read, byType };
  }

  async getRecentNotifications(userId: number, limit: number = 10): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // Helper method to send different types of notifications
  async sendReservationConfirmed(userId: number, reservationId: string, metadata?: any): Promise<Notification> {
    return await this.create({
      userId,
      type: NotificationType.RESERVATION_CONFIRMED,
      title: 'Reservation Confirmed',
      message: 'Your reservation has been confirmed.',
      metadata: { reservationId, ...metadata },
    });
  }

  async sendReservationCancelled(userId: number, reservationId: string, metadata?: any): Promise<Notification> {
    return await this.create({
      userId,
      type: NotificationType.RESERVATION_CANCELLED,
      title: 'Reservation Cancelled',
      message: 'Your reservation has been cancelled.',
      metadata: { reservationId, ...metadata },
    });
  }

  async sendQuoteProvided(userId: number, quoteId: string, metadata?: any): Promise<Notification> {
    return await this.create({
      userId,
      type: NotificationType.QUOTE_PROVIDED,
      title: 'Quote Provided',
      message: 'You have received a new quote.',
      metadata: { quoteId, ...metadata },
    });
  }

  async sendReminder(userId: number, message: string, metadata?: any): Promise<Notification> {
    return await this.create({
      userId,
      type: NotificationType.REMINDER,
      title: 'Reminder',
      message,
      metadata,
    });
  }

  async sendReviewRequest(userId: number, reservationId: string, metadata?: any): Promise<Notification> {
    return await this.create({
      userId,
      type: NotificationType.REVIEW_REQUEST,
      title: 'Review Request',
      message: 'Please share your experience with us.',
      metadata: { reservationId, ...metadata },
    });
  }
}