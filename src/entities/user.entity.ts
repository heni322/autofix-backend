import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Exclude } from 'class-transformer';
import { UserRole } from '../common/enums/user-role.enum';
import { Garage } from './garage.entity';
import { Reservation } from './reservation.entity';
import { Review } from './review.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  @Index()
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ nullable: true })
  refreshToken!: string;

  @OneToMany(() => Garage, (garage) => garage.owner)
  garages!: Garage[];

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations!: Reservation[];

  @OneToMany(() => Review, (review) => review.user)
  reviews!: Review[];
}
