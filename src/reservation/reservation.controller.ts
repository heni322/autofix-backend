import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';

// Define custom user type for the request
declare global {
  namespace Express {
    interface User {
      id: number;
      role: string;
    }
  }
}
import { ReservationService } from './reservation.service';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-guard';
import { UserRole } from 'src/common/enums/user-role.enum';
import { ProvideQuoteDto } from './dto/provide-quote.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('check-availability')
  @ApiOperation({ summary: 'Check slot availability' })
  checkAvailability(@Body() dto: CheckAvailabilityDto) {
    return this.reservationService.checkAvailability(dto);
  }

  @Get('available-slots')
  @ApiOperation({ summary: 'Get all available slots for a day' })
  getAvailableSlots(
    @Query('garageId', ParseIntPipe) garageId: number,
    @Query('serviceId', ParseIntPipe) serviceId: number,
    @Query('date') date: string,
  ) {
    return this.reservationService.getAvailableSlots(garageId, serviceId, date);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new reservation' })
  create(
    @Body() createDto: CreateReservationDto,
    @Request() req: ExpressRequest & { user: Express.User },
  ) {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      throw new BadRequestException('User authentication required');
    }

    // Set userId from JWT token (overrides any value from request body)
    createDto.userId = req.user.id;

    return this.reservationService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
    @Query('garageId', new ParseIntPipe({ optional: true })) garageId?: number,
    @Query('status') status?: string,
    @Request() req?: ExpressRequest & { user: Express.User },
  ) {
    const filters: any = {};

    // Users can only see their own reservations
    if (req && req.user && req.user.role === UserRole.CLIENT) {
      filters.userId = req.user.id;
    } else if (userId) {
      filters.userId = userId;
    }

    if (garageId) filters.garageId = garageId;
    if (status) filters.status = status;

    return this.reservationService.findAll(filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reservation by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.findOne(id);
  }

  @Patch(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GARAGE_OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm a reservation' })
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.confirm(id);
  }

  @Patch(':id/provide-quote')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GARAGE_OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Provide a quote for a reservation' })
  provideQuote(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProvideQuoteDto,
  ) {
    return this.reservationService.provideQuote(id, dto);
  }

  @Patch(':id/accept-quote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept a provided quote' })
  acceptQuote(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest & { user: Express.User },
  ) {
    return this.reservationService.acceptQuote(id, req.user.id);
  }

  @Patch(':id/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GARAGE_OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start service' })
  startService(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.startService(id);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GARAGE_OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete a reservation' })
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.complete(id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a reservation' })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason?: string },
  ) {
    return this.reservationService.cancel(id, body.reason);
  }
}
