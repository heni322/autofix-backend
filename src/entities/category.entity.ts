// category.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Service } from './service.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ unique: true })
  name!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column({ nullable: true })
  icon!: string;

  @Column({ default: 0 })
  sortOrder!: number;

  @Column({ default: true }) // ADD THIS
  isActive!: boolean;

  @OneToMany(() => Service, (service) => service.category)
  services!: Service[];
}
