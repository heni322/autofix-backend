import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GarageServiceService } from './garage-service.service';
import { GarageServiceController } from './garage-service.controller';
import { GarageService } from 'src/entities/garage-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GarageService])],
  controllers: [GarageServiceController],
  providers: [GarageServiceService],
})
export class GarageServiceModule {}