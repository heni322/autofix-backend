import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Service } from 'src/entities/service.entity';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Category])],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServicesModule {}
