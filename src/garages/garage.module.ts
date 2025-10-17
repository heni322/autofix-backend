import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Garage } from '../entities/garage.entity';
import { GarageService as GarageServiceEntity } from '../entities/garage-service.entity';
import { GarageController } from './garage.controller';
import { GarageService } from './garage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Garage, GarageServiceEntity])],
  controllers: [GarageController],
  providers: [GarageService],
})
export class GaragesModule {}
