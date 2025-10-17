import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseUUIDPipe,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ServiceService } from '../services/service.service';
import { CreateServiceDto } from './dto/create-service-dto';
import { UpdateServiceDto } from './dto/update-service-dto';
import { ServiceWithStats } from './interface/service-with-stats-interface';
import { Service } from '../entities/service.entity';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createServiceDto: CreateServiceDto,
  ): Promise<Service> {
    return await this.serviceService.create(createServiceDto);
  }

  @Get()
  async findAll(): Promise<Service[]> {
    return await this.serviceService.findAll();
  }

  @Get('popular')
  async getPopularServices(
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<Service[]> {
    return await this.serviceService.getPopularServices(limit);
  }

  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<Service[]> {
    return await this.serviceService.findByCategory(categoryId);
  }

  @Get('category-stats')
  async getServiceCountByCategory(): Promise<
    { categoryId: number; categoryName: string; count: number }[]
  > {
    return await this.serviceService.countServicesByCategory();
  }

  @Get('garage/:garageId')
  async getServicesByGarage(
    @Param('garageId', ParseIntPipe) garageId: number,
  ): Promise<Service[]> {
    return await this.serviceService.getServicesByGarage(garageId);
  }

  @Get('search')
  async searchByName(@Query('name') name: string): Promise<Service[]> {
    return await this.serviceService.findByName(name);
  }

  @Get('duration')
  async findByDuration(
    @Query('min', ParseIntPipe) minDuration: number,
    @Query('max', ParseIntPipe) maxDuration: number,
  ): Promise<Service[]> {
    return await this.serviceService.findByDuration(minDuration, maxDuration);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Service> {
    return await this.serviceService.findOne(id);
  }

  @Get(':id/stats')
  async getServiceWithStats(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ServiceWithStats> {
    return await this.serviceService.getServiceWithStats(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    return await this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.serviceService.remove(id);
  }
}
