import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { GarageService } from './garage-service.entity';
import { Reservation } from './reservation.entity';
import { Review } from './review.entity';

@Entity('garages')
export class Garage extends BaseEntity {
  @Column()
  name!: string;

  @Column('text')
  description!: string;

  @Column()
  address!: string;

  @Column()
  @Index()
  city!: string;

  @Column()
  postalCode!: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude!: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude!: number;

  @Column()
  phone!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  website!: string;

  @Column('simple-array', { nullable: true })
  images!: string[];

  @Column({ type: 'json', nullable: true })
  openingHours!: Record<string, { open: string; close: string }>;

  @Column({ default: true })
  @Index()
  isActive!: boolean;

  @Column({ default: false })
  isVerified!: boolean;

  @Column()
  @Index()
  ownerId!: number;

  @ManyToOne(() => User, (user) => user.garages)
  owner!: User;

  @OneToMany(() => GarageService, (gs) => gs.garage, { cascade: true })
  garageServices!: GarageService[];

  @OneToMany(() => Reservation, (reservation) => reservation.garage)
  reservations!: Reservation[];

  @OneToMany(() => Review, (review) => review.garage)
  reviews!: Review[];
}
