import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Garage } from './garage.entity';
import { Service } from './service.entity';
import { ReservationStatus } from 'src/common/enums/reservation-status.enum';

@Entity('reservations')
@Index(['garageId', 'serviceId', 'timeSlot'])
@Index(['userId', 'status'])
export class Reservation extends BaseEntity {
  @Column()
  @Index()
  userId!: number;

  @Column()
  @Index()
  garageId!: number;

  @Column()
  @Index()
  serviceId!: number;

  @Column({ type: 'timestamp' })
  timeSlot!: Date;

  @Column({ type: 'timestamp' })
  endTime!: Date;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  @Index()
  status!: ReservationStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price!: number;

  @Column('text', { nullable: true })
  clientNotes!: string;

  @Column('text', { nullable: true })
  garageNotes!: string;

  @Column({ nullable: true })
  cancellationReason!: string;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt!: Date;

  @ManyToOne(() => User, (user) => user.reservations)
  user!: User;

  @ManyToOne(() => Garage, (garage) => garage.reservations)
  garage!: Garage;

  @ManyToOne(() => Service, (service) => service.reservations)
  service!: Service;
}
