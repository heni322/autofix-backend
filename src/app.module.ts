import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { User } from './entities/user.entity';
import { Garage } from './entities/garage.entity';
import { Service } from './entities/service.entity';
import { Category } from './entities/category.entity';
import { GarageService } from './entities/garage-service.entity';
import { Review } from './entities/review.entity';
import { Reservation } from './entities/reservation.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GaragesModule } from './garages/garage.module';
import { CategoriesModule } from './categories/category.module';
import { ServicesModule } from './services/services.module';
import { GarageServiceModule } from './garage-service/garage-service.module';
import { ReservationModule } from './reservation/reservation.module';
import { ReviewsModule } from './reviews/review.module';
import { NotificationsModule } from './notifications/notification.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [
          User,
          Category,
          Service,
          Garage,
          GarageService,
          Review,
          Reservation,
        ],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Event Emitter
    EventEmitterModule.forRoot(),

    // Feature Modules
    AuthModule,
    UsersModule,
    GaragesModule,
    CategoriesModule,
    ServicesModule,
    GarageServiceModule,
    ReservationModule,
    NotificationsModule,
    ReviewsModule,
  ],
})
export class AppModule {}
