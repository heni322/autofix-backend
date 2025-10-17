import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GarageService } from '../entities/garage-service.entity';
import { CreateGarageServiceDto } from './dto/create-garage-service.dto';
import { PricingType } from '../common/enums/pricing-type.enum';

@Injectable()
export class GarageServiceService {
  constructor(
    @InjectRepository(GarageService)
    private garageServiceRepository: Repository<GarageService>,
  ) {}

  async create(createDto: CreateGarageServiceDto): Promise<GarageService> {
    // Check if service already exists for this garage
    const existing = await this.garageServiceRepository.findOne({
      where: {
        garageId: createDto.garageId,
        serviceId: createDto.serviceId,
      },
    });

    if (existing) {
      throw new BadRequestException('Service already exists for this garage');
    }

    // Validate price based on pricing type
    this.validatePricing(createDto.pricingType, createDto.price);

    const garageService = this.garageServiceRepository.create(createDto);
    return await this.garageServiceRepository.save(garageService);
  }

  async findByGarage(garageId: number): Promise<GarageService[]> {
    return await this.garageServiceRepository.find({
      where: { garageId },
      relations: ['service', 'service.category'],
      order: { service: { name: 'ASC' } },
    });
  }

  async findAvailableByGarage(garageId: number): Promise<GarageService[]> {
    return await this.garageServiceRepository.find({
      where: { garageId, isAvailable: true },
      relations: ['service', 'service.category'],
      order: { service: { name: 'ASC' } },
    });
  }

  async findOne(id: number): Promise<GarageService> {
    const garageService = await this.garageServiceRepository.findOne({
      where: { id },
      relations: ['service', 'garage', 'service.category'],
    });

    if (!garageService) {
      throw new NotFoundException('Garage service not found');
    }

    return garageService;
  }

  async findByGarageAndService(garageId: number, serviceId: number): Promise<GarageService> {
    const garageService = await this.garageServiceRepository.findOne({
      where: { garageId, serviceId },
      relations: ['service', 'garage'],
    });

    if (!garageService) {
      throw new NotFoundException('Service not found for this garage');
    }

    return garageService;
  }

  async update(id: number, updateData: Partial<CreateGarageServiceDto>): Promise<GarageService> {
    const garageService = await this.findOne(id);

    // Validate pricing if being updated
    if (updateData.pricingType || updateData.price !== undefined) {
      const pricingType = updateData.pricingType || garageService.pricingType;
      const price = updateData.price !== undefined ? updateData.price : garageService.price;
      this.validatePricing(pricingType, price);
    }

    Object.assign(garageService, updateData);
    return await this.garageServiceRepository.save(garageService);
  }

  async toggleAvailability(id: number): Promise<GarageService> {
    const garageService = await this.findOne(id);
    garageService.isAvailable = !garageService.isAvailable;
    return await this.garageServiceRepository.save(garageService);
  }

  async remove(id: number): Promise<void> {
    const result = await this.garageServiceRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException('Garage service not found');
    }
  }

  private validatePricing(pricingType: PricingType, price?: number): void {
    if (pricingType === PricingType.FIXED && !price) {
      throw new BadRequestException('Price is required for FIXED pricing type');
    }

    if ((pricingType === PricingType.QUOTE || pricingType === PricingType.CONSULTATION) && price) {
      throw new BadRequestException('Price should not be set for QUOTE or CONSULTATION pricing types');
    }
  }
}