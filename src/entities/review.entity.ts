import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Garage } from './garage.entity';

@Entity('reviews')
export class Review extends BaseEntity {
  @Column()
  @Index()
  userId!: number;

  @Column()
  @Index()
  garageId!: number;

  @Column({ type: 'int' })
  rating!: number;

  @Column('text', { nullable: true })
  comment!: string;

  @Column({ nullable: true })
  reservationId!: number;

  @Column({ default: false })
  isVerified!: boolean;

  @ManyToOne(() => User, user => user.reviews)
  user!: User;

  @ManyToOne(() => Garage, garage => garage.reviews)
  garage!: Garage;
}