import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { CreateReviewDto } from './dto/create-review-dto';
import { UpdateReviewDto } from './dto/update-review-dto';
import { ReviewStats } from './interface/review-stats-interface';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    // Validate rating is between 1 and 5
    if (createReviewDto.rating < 1 || createReviewDto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Check if user already reviewed this garage
    const existingReview = await this.reviewRepository.findOne({
      where: {
        userId: createReviewDto.userId,
        garageId: createReviewDto.garageId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this garage');
    }

    const review = this.reviewRepository.create(createReviewDto);
    return await this.reviewRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return await this.reviewRepository.find({
      relations: ['user', 'garage'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['user', 'garage'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async findByGarage(garageId: number): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { garageId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: number): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { userId },
      relations: ['garage'],
      order: { createdAt: 'DESC' },
    });
  }

  async findVerifiedReviews(garageId: number): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { garageId, isVerified: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, userId: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);

    // Check if user owns this review
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Validate rating if provided
    if (updateReviewDto.rating && (updateReviewDto.rating < 1 || updateReviewDto.rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    Object.assign(review, updateReviewDto);
    return await this.reviewRepository.save(review);
  }

  async remove(id: string, userId: number): Promise<void> {
    const review = await this.findOne(id);

    // Check if user owns this review
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewRepository.remove(review);
  }

  async verifyReview(id: string): Promise<Review> {
    const review = await this.findOne(id);
    review.isVerified = true;
    return await this.reviewRepository.save(review);
  }

  async unverifyReview(id: string): Promise<Review> {
    const review = await this.findOne(id);
    review.isVerified = false;
    return await this.reviewRepository.save(review);
  }

  async getGarageStats(garageId: number): Promise<ReviewStats> {
    const reviews = await this.reviewRepository.find({
      where: { garageId },
    });

    const totalReviews = reviews.length;
    
    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const sumRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = parseFloat((sumRatings / totalReviews).toFixed(2));

    const ratingDistribution = reviews.reduce(
      (dist, review) => {
        dist[review.rating as keyof typeof dist]++;
        return dist;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    );

    return {
      averageRating,
      totalReviews,
      ratingDistribution,
    };
  }

  async hasUserReviewedGarage(userId: number, garageId: number): Promise<boolean> {
    const review = await this.reviewRepository.findOne({
      where: { userId, garageId },
    });
    return !!review;
  }
}