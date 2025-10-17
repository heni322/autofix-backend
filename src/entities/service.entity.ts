// service.entity.ts
import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Category } from './category.entity';
import { GarageService } from './garage-service.entity';
import { Reservation } from './reservation.entity';

@Entity('services')
export class Service extends BaseEntity {
  @Column()
  name!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column({ type: 'int', default: 60 })
  durationMinutes!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) // ADD THIS
  basePrice!: number;

  @Column({ type: 'int', default: 60 }) // ADD THIS (or rename durationMinutes)
  estimatedDuration!: number;

  @Column({ default: true }) // ADD THIS
  isActive!: boolean;

  @Column()
  @Index()
  categoryId!: number;

  @ManyToOne(() => Category, (category) => category.services)
  category!: Category;

  @OneToMany(() => GarageService, (gs) => gs.service)
  garageServices!: GarageService[];

  @OneToMany(() => Reservation, (reservation) => reservation.service)
  reservations!: Reservation[];
}
