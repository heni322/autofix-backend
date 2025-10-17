import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { ReservationStatus } from '../common/enums/reservation-status.enum';

@Injectable()
export class ReservationRepository extends Repository<Reservation> {
  constructor(dataSource: DataSource) {
    super(Reservation, dataSource.createEntityManager());
  }

  async findUpcomingByUser(userId: number): Promise<Reservation[]> {
    return this.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.garage', 'garage')
      .leftJoinAndSelect('reservation.service', 'service')
      .where('reservation.userId = :userId', { userId })
      .andWhere('reservation.timeSlot > :now', { now: new Date() })
      .andWhere('reservation.status NOT IN (:...statuses)', {
        statuses: [ReservationStatus.CANCELLED, ReservationStatus.COMPLETED, ReservationStatus.NO_SHOW]
      })
      .orderBy('reservation.timeSlot', 'ASC')
      .getMany();
  }

  async findByGarageAndDateRange(
    garageId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Reservation[]> {
    return this.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.user', 'user')
      .leftJoinAndSelect('reservation.service', 'service')
      .where('reservation.garageId = :garageId', { garageId })
      .andWhere('reservation.timeSlot BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
      .andWhere('reservation.status NOT IN (:...statuses)', {
        statuses: [ReservationStatus.CANCELLED]
      })
      .orderBy('reservation.timeSlot', 'ASC')
      .getMany();
  }

  async countConflictingReservations(
    garageId: number,
    serviceId: number,
    startTime: Date,
    endTime: Date,
    excludeId?: number
  ): Promise<number> {
    const query = this.createQueryBuilder('reservation')
      .where('reservation.garageId = :garageId', { garageId })
      .andWhere('reservation.serviceId = :serviceId', { serviceId })
      .andWhere('reservation.status IN (:...statuses)', {
        statuses: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.IN_PROGRESS]
      })
      .andWhere('reservation.timeSlot < :endTime', { endTime })
      .andWhere('reservation.endTime > :startTime', { startTime });

    if (excludeId) {
      query.andWhere('reservation.id != :excludeId', { excludeId });
    }

    return query.getCount();
  }

  async findPendingQuotes(garageId: number): Promise<Reservation[]> {
    return this.find({
      where: {
        garageId,
        status: ReservationStatus.PENDING_QUOTE
      },
      relations: ['user', 'service'],
      order: { createdAt: 'ASC' }
    });
  }
}