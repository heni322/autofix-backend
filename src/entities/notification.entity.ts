import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum NotificationType {
  RESERVATION_CONFIRMED = 'RESERVATION_CONFIRMED',
  RESERVATION_CANCELLED = 'RESERVATION_CANCELLED',
  QUOTE_PROVIDED = 'QUOTE_PROVIDED',
  REMINDER = 'REMINDER',
  REVIEW_REQUEST = 'REVIEW_REQUEST',
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column()
  @Index()
  userId!: number;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type!: NotificationType;

  @Column()
  title!: string;

  @Column('text')
  message!: string;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ type: 'json', nullable: true })
  metadata!: any;

  @ManyToOne(() => User)
  user!: User;
}
