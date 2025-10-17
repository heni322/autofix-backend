import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../entities/reservation.entity';
import { GarageService } from '../entities/garage-service.entity';
import { Service } from '../entities/service.entity';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { ReservationRepository } from './reservation.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, GarageService, Service])],
  controllers: [ReservationController],
  providers: [ReservationService, ReservationRepository],
  exports: [ReservationService, ReservationRepository],
})
export class ReservationModule {}
