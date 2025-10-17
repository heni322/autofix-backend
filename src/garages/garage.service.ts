import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Garage } from '../entities/garage.entity';
import { GarageService as GarageServiceEntity } from '../entities/garage-service.entity';
import { CreateGarageDto } from './dto/create-garage.dto';
import { UpdateGarageDto } from './dto/update-garage.dto';

@Injectable()
export class GarageService {
  constructor(
    @InjectRepository(Garage)
    private garageRepository: Repository<Garage>,
    @InjectRepository(GarageServiceEntity)
    private garageServiceRepository: Repository<GarageServiceEntity>,
  ) {}

  async create(createGarageDto: CreateGarageDto, ownerId: number) {
    const garage = this.garageRepository.create({
      ...createGarageDto,
      ownerId,
      isActive: true,
      isVerified: false, // Will be verified by admin
    });
    return this.garageRepository.save(garage);
  }

  async findAll(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    city?: string;
    isActive?: boolean;
    isVerified?: boolean;
    categoryId?: number;
    serviceId?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const query = this.garageRepository
      .createQueryBuilder('garage')
      .leftJoinAndSelect('garage.reviews', 'reviews')
      .leftJoinAndSelect('garage.garageServices', 'garageServices')
      .leftJoinAndSelect('garageServices.service', 'service')
      .leftJoinAndSelect('service.category', 'category');

    // Search by name or address
    if (filters?.search) {
      query.andWhere(
        '(LOWER(garage.name) LIKE LOWER(:search) OR LOWER(garage.address) LIKE LOWER(:search) OR LOWER(garage.description) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.city) {
      query.andWhere('LOWER(garage.city) LIKE LOWER(:city)', {
        city: `%${filters.city}%`,
      });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('garage.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters?.isVerified !== undefined) {
      query.andWhere('garage.isVerified = :isVerified', {
        isVerified: filters.isVerified,
      });
    }

    if (filters?.categoryId) {
      query.andWhere('category.id = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters?.serviceId) {
      query.andWhere('service.id = :serviceId', {
        serviceId: filters.serviceId,
      });
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    query.skip(skip).take(limit);

    const garages = await query.getMany();

    return {
      data: garages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const garage = await this.garageRepository.findOne({
      where: { id },
      relations: [
        'reviews',
        'garageServices',
        'garageServices.service',
        'garageServices.service.category',
      ],
    });

    if (!garage) {
      throw new NotFoundException(`Garage with ID ${id} not found`);
    }

    return garage;
  }

  async findByOwnerId(ownerId: number) {
    return this.garageRepository.find({
      where: { ownerId },
      relations: [
        'garageServices',
        'garageServices.service',
        'garageServices.service.category',
        'reviews',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async getGarageServices(
    garageId: number,
    filters?: {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: number;
      isAvailable?: boolean;
    },
  ) {
    // Verify garage exists
    const garage = await this.garageRepository.findOne({
      where: { id: garageId },
    });

    if (!garage) {
      throw new NotFoundException(`Garage with ID ${garageId} not found`);
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.garageServiceRepository
      .createQueryBuilder('garageService')
      .leftJoinAndSelect('garageService.service', 'service')
      .leftJoinAndSelect('service.category', 'category')
      .where('garageService.garageId = :garageId', { garageId });

    // Search by service name or description
    if (filters?.search) {
      query.andWhere(
        '(LOWER(service.name) LIKE LOWER(:search) OR LOWER(service.description) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }

    // Filter by category
    if (filters?.categoryId) {
      query.andWhere('service.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    // Filter by availability
    if (filters?.isAvailable !== undefined) {
      query.andWhere('garageService.isAvailable = :isAvailable', {
        isAvailable: filters.isAvailable,
      });
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    query.skip(skip).take(limit);

    // Order by service name
    query.orderBy('service.name', 'ASC');

    const garageServices = await query.getMany();

    return {
      data: garageServices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        garageId,
        garageName: garage.name,
      },
    };
  }

  async update(id: number, updateGarageDto: UpdateGarageDto, userId: number) {
    const garage = await this.findOne(id);

    // Check if user owns this garage
    if (garage.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own garages');
    }

    Object.assign(garage, updateGarageDto);
    return this.garageRepository.save(garage);
  }
}
