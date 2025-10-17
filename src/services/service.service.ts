import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../entities/service.entity';
import { Category } from 'src/entities/category.entity';

import { CreateServiceDto } from './dto/create-service-dto';
import { UpdateServiceDto } from './dto/update-service-dto';
import { ServiceWithStats } from './interface/service-with-stats-interface';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    // Validate category exists
    const category = await this.categoryRepository.findOne({
      where: { id: createServiceDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${createServiceDto.categoryId} not found`,
      );
    }

    // Validate duration
    if (
      createServiceDto.durationMinutes &&
      createServiceDto.durationMinutes <= 0
    ) {
      throw new BadRequestException('Duration must be greater than 0');
    }

    const service = this.serviceRepository.create(createServiceDto);
    return await this.serviceRepository.save(service);
  }

  async findAll(): Promise<Service[]> {
    return await this.serviceRepository.find({
      relations: ['category', 'garageServices', 'reservations'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['category', 'garageServices', 'reservations'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async findByCategory(categoryId: number): Promise<Service[]> {
    return await this.serviceRepository.find({
      where: { categoryId },
      relations: ['category'],
      order: { name: 'ASC' },
    });
  }

  async findByName(name: string): Promise<Service[]> {
    return await this.serviceRepository
      .createQueryBuilder('service')
      .where('LOWER(service.name) LIKE LOWER(:name)', { name: `%${name}%` })
      .leftJoinAndSelect('service.category', 'category')
      .orderBy('service.name', 'ASC')
      .getMany();
  }

  async findByDuration(
    minDuration: number,
    maxDuration: number,
  ): Promise<Service[]> {
    return await this.serviceRepository
      .createQueryBuilder('service')
      .where('service.durationMinutes >= :minDuration', { minDuration })
      .andWhere('service.durationMinutes <= :maxDuration', { maxDuration })
      .leftJoinAndSelect('service.category', 'category')
      .orderBy('service.durationMinutes', 'ASC')
      .getMany();
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    const service = await this.findOne(id);

    // Validate category if provided
    if (updateServiceDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateServiceDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateServiceDto.categoryId} not found`,
        );
      }
    }

    // Validate duration if provided
    if (
      updateServiceDto.durationMinutes &&
      updateServiceDto.durationMinutes <= 0
    ) {
      throw new BadRequestException('Duration must be greater than 0');
    }

    Object.assign(service, updateServiceDto);
    return await this.serviceRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);

    // Check if service has active reservations
    if (service.reservations && service.reservations.length > 0) {
      throw new BadRequestException(
        'Cannot delete service with existing reservations',
      );
    }

    await this.serviceRepository.remove(service);
  }

  async getServiceWithStats(id: string): Promise<ServiceWithStats> {
    const service = await this.serviceRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['category', 'garageServices', 'reservations'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return {
      service,
      totalReservations: service.reservations?.length || 0,
      totalGarages: service.garageServices?.length || 0,
    };
  }

  async getPopularServices(limit: number = 10): Promise<Service[]> {
    return await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.reservations', 'reservations')
      .loadRelationCountAndMap(
        'service.reservationCount',
        'service.reservations',
      )
      .orderBy('service.reservationCount', 'DESC')
      .take(limit)
      .getMany();
  }

  async getServicesByGarage(garageId: number): Promise<Service[]> {
    return await this.serviceRepository
      .createQueryBuilder('service')
      .innerJoin('service.garageServices', 'garageService')
      .where('garageService.garageId = :garageId', { garageId })
      .leftJoinAndSelect('service.category', 'category')
      .orderBy('service.name', 'ASC')
      .getMany();
  }

  async countServicesByCategory(): Promise<
    { categoryId: number; categoryName: string; count: number }[]
  > {
    const result = await this.serviceRepository
      .createQueryBuilder('service')
      .select('service.categoryId', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('COUNT(service.id)', 'count')
      .innerJoin('service.category', 'category')
      .groupBy('service.categoryId')
      .addGroupBy('category.name')
      .orderBy('count', 'DESC')
      .getRawMany();

    return result.map((r) => ({
      categoryId: parseInt(r.categoryId),
      categoryName: r.categoryName,
      count: parseInt(r.count),
    }));
  }
}
