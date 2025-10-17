import { Controller, Get, Post, Put, Body, Param, UseGuards, Query, ParseIntPipe, Request, DefaultValuePipe } from '@nestjs/common';
import { GarageService } from './garage.service';
import { CreateGarageDto } from './dto/create-garage.dto';
import { UpdateGarageDto } from './dto/update-garage.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-guard';
import { Request as ExpressRequest } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/enums/user-role.enum';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

// Define custom user type for the request
declare global {
  namespace Express {
    interface User {
      id: number;
      role: string;
    }
  }
}

@ApiTags('Garages')
@Controller('garages')
export class GarageController {
  constructor(private readonly garageService: GarageService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GARAGE_OWNER, UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new garage' })
  create(
    @Body() createGarageDto: CreateGarageDto,
    @Request() req: ExpressRequest & { user: Express.User }
  ) {
    return this.garageService.create(createGarageDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all garages with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isVerified', required: false, type: Boolean })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'serviceId', required: false, type: Number })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('isActive') isActive?: string,
    @Query('isVerified') isVerified?: string,
    @Query('categoryId', new ParseIntPipe({ optional: true })) categoryId?: number,
    @Query('serviceId', new ParseIntPipe({ optional: true })) serviceId?: number,
  ) {
    return this.garageService.findAll({
      page,
      limit,
      search,
      city,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
      categoryId,
      serviceId,
    });
  }

  // Get garages owned by the current user
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GARAGE_OWNER, UserRole.ADMIN)
  @Get('my-garages')
  @ApiOperation({ summary: 'Get garages owned by current user' })
  findMyGarages(@Request() req: ExpressRequest & { user: Express.User }) {
    return this.garageService.findByOwnerId(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get garage by ID' })
  findOne(@Param('id') id: string) {
    return this.garageService.findOne(+id);
  }

  @Get(':id/services')
  @ApiOperation({ summary: 'Get all services available at a specific garage' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'isAvailable', required: false, type: Boolean })
  getGarageServices(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('categoryId', new ParseIntPipe({ optional: true })) categoryId?: number,
    @Query('isAvailable') isAvailable?: string,
  ) {
    return this.garageService.getGarageServices(id, {
      page,
      limit,
      search,
      categoryId,
      isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
    });
  }

  // Update garage
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GARAGE_OWNER, UserRole.ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update garage' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGarageDto: UpdateGarageDto,
    @Request() req: ExpressRequest & { user: Express.User }
  ) {
    return this.garageService.update(id, updateGarageDto, req.user.id);
  }
}
