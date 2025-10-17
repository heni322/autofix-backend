import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GarageServiceService } from './garage-service.service';
import { CreateGarageServiceDto } from './dto/create-garage-service.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/enums/user-role.enum';

@ApiTags('Garage Services')
@Controller('garage-services')
export class GarageServiceController {
  constructor(private readonly garageServiceService: GarageServiceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GARAGE_OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add service to garage' })
  create(@Body() createDto: CreateGarageServiceDto) {
    return this.garageServiceService.create(createDto);
  }

  @Get('garage/:garageId')
  @ApiOperation({ summary: 'Get all services for a garage' })
  findByGarage(@Param('garageId', ParseIntPipe) garageId: number) {
    return this.garageServiceService.findByGarage(garageId);
  }

  @Get('garage/:garageId/available')
  @ApiOperation({ summary: 'Get available services for a garage' })
  findAvailableByGarage(@Param('garageId', ParseIntPipe) garageId: number) {
    return this.garageServiceService.findAvailableByGarage(garageId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get garage service by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.garageServiceService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GARAGE_OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update garage service' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreateGarageServiceDto>,
  ) {
    return this.garageServiceService.update(id, updateDto);
  }

  @Patch(':id/toggle-availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GARAGE_OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle service availability' })
  toggleAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.garageServiceService.toggleAvailability(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GARAGE_OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove service from garage' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.garageServiceService.remove(id);
  }
}