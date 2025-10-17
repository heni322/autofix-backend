import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PricingType } from '../common/enums/pricing-type.enum';        
import { Repository } from 'typeorm';

import { Reservation } from '../entities/reservation.entity';
import { ReservationRepository } from './reservation.repository';
import { GarageService } from 'src/entities/garage-service.entity';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationStatus } from 'src/common/enums/reservation-status.enum';
import { ProvideQuoteDto } from './dto/provide-quote.dto';

@Injectable()
export class ReservationService {
  constructor(
    private reservationRepository: ReservationRepository,
    @InjectRepository(GarageService)
    private garageServiceRepository: Repository<GarageService>,
    private eventEmitter: EventEmitter2,
  ) {}

  async checkAvailability(dto: CheckAvailabilityDto): Promise<{
    available: boolean;
    capacity: number;
    booked: number;
    remainingSlots: number;
    pricingType: PricingType;
    price?: number;
  }> {
    const timeSlot = new Date(dto.timeSlot);

    // Get garage service configuration
    const garageService = await this.garageServiceRepository.findOne({
      where: {
        garageId: dto.garageId,
        serviceId: dto.serviceId,
        isAvailable: true
      },
      relations: ['service'],
    });

    if (!garageService) {
      throw new NotFoundException('Service not available at this garage');
    }

    // Calculate end time
    const endTime = new Date(timeSlot);
    endTime.setMinutes(endTime.getMinutes() + garageService.service.durationMinutes);

    // Count conflicting reservations
    const bookedCount = await this.reservationRepository.countConflictingReservations(
      dto.garageId,
      dto.serviceId,
      timeSlot,
      endTime
    );

    const remainingSlots = garageService.capacity - bookedCount;

    return {
      available: remainingSlots > 0,
      capacity: garageService.capacity,
      booked: bookedCount,
      remainingSlots: Math.max(0, remainingSlots),
      pricingType: garageService.pricingType,
      price: garageService.price,
    };
  }

  async create(createDto: CreateReservationDto): Promise<Reservation> {
    // Check availability
    const availability = await this.checkAvailability({
      garageId: createDto.garageId,
      serviceId: createDto.serviceId,
      timeSlot: createDto.timeSlot,
    });

    if (!availability.available) {
      throw new BadRequestException('No available slots for this time');
    }

    // Get service details
    const garageService = await this.garageServiceRepository.findOne({
      where: {
        garageId: createDto.garageId,
        serviceId: createDto.serviceId
      },
      relations: ['service'],
    });

    if (!garageService) {
      throw new NotFoundException('Service not found');
    }

    const timeSlot = new Date(createDto.timeSlot);
    const endTime = new Date(timeSlot);
    endTime.setMinutes(endTime.getMinutes() + garageService.service.durationMinutes);

    // Determine status and price based on pricing type
    let status = ReservationStatus.PENDING;
    let price: number | undefined = undefined;

    switch (garageService.pricingType) {
      case PricingType.FIXED:
        price = garageService.price;
        status = ReservationStatus.PENDING;
        break;
      case PricingType.QUOTE:
        status = ReservationStatus.PENDING_QUOTE;
        break;
      case PricingType.CONSULTATION:
        status = ReservationStatus.PENDING_CONSULTATION;
        break;
    }

    // Create reservation
    const reservation = this.reservationRepository.create({
      userId: createDto.userId,
      garageId: createDto.garageId,
      serviceId: createDto.serviceId,
      timeSlot,
      endTime,
      price,
      status,
      clientNotes: createDto.clientNotes,
    });

    const savedReservation = await this.reservationRepository.save(reservation);

    // Emit event for notifications
    this.eventEmitter.emit('reservation.created', { reservation: savedReservation });

    return savedReservation;
  }

  async findAll(filters?: {
    userId?: number;
    garageId?: number;
    status?: ReservationStatus;
  }): Promise<Reservation[]> {
    const query = this.reservationRepository.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.user', 'user')
      .leftJoinAndSelect('reservation.garage', 'garage')
      .leftJoinAndSelect('reservation.service', 'service');

    if (filters?.userId) {
      query.andWhere('reservation.userId = :userId', { userId: filters.userId });
    }

    if (filters?.garageId) {
      query.andWhere('reservation.garageId = :garageId', { garageId: filters.garageId });
    }

    if (filters?.status) {
      query.andWhere('reservation.status = :status', { status: filters.status });
    }

    return query.orderBy('reservation.timeSlot', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'garage', 'service'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  async provideQuote(id: number, dto: ProvideQuoteDto): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.PENDING_QUOTE) {
      throw new BadRequestException('Can only provide quote for PENDING_QUOTE reservations');
    }

    reservation.price = dto.price;
    reservation.status = ReservationStatus.QUOTE_PROVIDED;
    reservation.garageNotes = dto.garageNotes || '';

    const updated = await this.reservationRepository.save(reservation);

    // Emit event
    this.eventEmitter.emit('quote.provided', { reservation: updated });

    return updated;
  }

  async acceptQuote(id: number, userId: number): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.userId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    if (reservation.status !== ReservationStatus.QUOTE_PROVIDED) {
      throw new BadRequestException('Can only accept QUOTE_PROVIDED reservations');
    }

    reservation.status = ReservationStatus.CONFIRMED;
    reservation.confirmedAt = new Date();

    const updated = await this.reservationRepository.save(reservation);

    this.eventEmitter.emit('reservation.confirmed', { reservation: updated });

    return updated;
  }

  async confirm(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (![ReservationStatus.PENDING].includes(reservation.status)) {
      throw new BadRequestException('Cannot confirm this reservation');
    }

    reservation.status = ReservationStatus.CONFIRMED;
    reservation.confirmedAt = new Date();

    const updated = await this.reservationRepository.save(reservation);

    this.eventEmitter.emit('reservation.confirmed', { reservation: updated });

    return updated;
  }

  async startService(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Can only start confirmed reservations');
    }

    reservation.status = ReservationStatus.IN_PROGRESS;

    return await this.reservationRepository.save(reservation);
  }

  async complete(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (![ReservationStatus.CONFIRMED, ReservationStatus.IN_PROGRESS].includes(reservation.status)) {
      throw new BadRequestException('Cannot complete this reservation');
    }

    reservation.status = ReservationStatus.COMPLETED;
    reservation.completedAt = new Date();

    const updated = await this.reservationRepository.save(reservation);

    this.eventEmitter.emit('reservation.completed', { reservation: updated });

    return updated;
  }

  async cancel(id: number, reason?: string): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if ([ReservationStatus.COMPLETED, ReservationStatus.CANCELLED].includes(reservation.status)) {
      throw new BadRequestException('Cannot cancel this reservation');
    }

    reservation.status = ReservationStatus.CANCELLED;
    reservation.cancellationReason = reason || '';
    reservation.cancelledAt = new Date();

    const updated = await this.reservationRepository.save(reservation);

    this.eventEmitter.emit('reservation.cancelled', { reservation: updated });

    return updated;
  }

  async getAvailableSlots(
    garageId: number,
    serviceId: number,
    date: string,
  ): Promise<Array<{ timeSlot: string; available: boolean; remainingSlots: number }>> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const slots: Array<{ timeSlot: string; available: boolean; remainingSlots: number }> = [];
    const startHour = 8;
    const endHour = 18;
    const intervalMinutes = 30;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const slotTime = new Date(targetDate);
        slotTime.setHours(hour, minute, 0, 0);

        try {
          const availability = await this.checkAvailability({
            garageId,
            serviceId,
            timeSlot: slotTime.toISOString(),
          });

          slots.push({
            timeSlot: slotTime.toISOString(),
            available: availability.available,
            remainingSlots: availability.remainingSlots,
          });
        } catch (error) {
          // Skip if service not available
          continue;
        }
      }
    }

    return slots;
  }
}