import { Entity, Column, ManyToOne, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Garage } from './garage.entity';
import { Service } from './service.entity';
import { PricingType } from '../common/enums/pricing-type.enum';

@Entity('garage_services')
@Unique(['garageId', 'serviceId'])
export class GarageService extends BaseEntity {
  @Column()
  @Index()
  garageId!: number;

  @Column()
  @Index()
  serviceId!: number;

  @Column({ type: 'int' })
  capacity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price!: number;

  @Column({ type: 'enum', enum: PricingType, default: PricingType.FIXED })
  pricingType!: PricingType;

  @Column({ default: true })
  isAvailable!: boolean;

  @Column('text', { nullable: true })
  notes!: string;

  @ManyToOne(() => Garage, garage => garage.garageServices, { onDelete: 'CASCADE' })
  garage!: Garage;

  @ManyToOne(() => Service, service => service.garageServices)
  service!: Service;
}