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
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { Review } from '../entities/review.entity';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review-dto';
import { ReviewStats } from './interface/review-stats-interface';
import { UpdateReviewDto } from './dto/update-review-dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    return await this.reviewService.create(createReviewDto);
  }

  @Get()
  async findAll(): Promise<Review[]> {
    return await this.reviewService.findAll();
  }

  @Get('garage/:garageId')
  async findByGarage(
    @Param('garageId', ParseIntPipe) garageId: number,
  ): Promise<Review[]> {
    return await this.reviewService.findByGarage(garageId);
  }

  @Get('garage/:garageId/verified')
  async findVerifiedByGarage(
    @Param('garageId', ParseIntPipe) garageId: number,
  ): Promise<Review[]> {
    return await this.reviewService.findVerifiedReviews(garageId);
  }

  @Get('garage/:garageId/stats')
  async getGarageStats(
    @Param('garageId', ParseIntPipe) garageId: number,
  ): Promise<ReviewStats> {
    return await this.reviewService.getGarageStats(garageId);
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Review[]> {
    return await this.reviewService.findByUser(userId);
  }

  @Get('check')
  async hasUserReviewed(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('garageId', ParseIntPipe) garageId: number,
  ): Promise<{ hasReviewed: boolean }> {
    const hasReviewed = await this.reviewService.hasUserReviewedGarage(userId, garageId);
    return { hasReviewed };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Review> {
    return await this.reviewService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateReviewDto: UpdateReviewDto,
    @Body('userId', ParseIntPipe) userId: number,
  ): Promise<Review> {
    return await this.reviewService.update(id, userId, updateReviewDto);
  }

  @Patch(':id/verify')
  async verify(@Param('id', ParseUUIDPipe) id: string): Promise<Review> {
    return await this.reviewService.verifyReview(id);
  }

  @Patch(':id/unverify')
  async unverify(@Param('id', ParseUUIDPipe) id: string): Promise<Review> {
    return await this.reviewService.unverifyReview(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    return await this.reviewService.remove(id, userId);
  }
}