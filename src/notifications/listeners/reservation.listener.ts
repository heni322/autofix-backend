import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';


@Injectable()
export class ReservationListener {
  private readonly logger = new Logger(ReservationListener.name);

  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  @OnEvent('reservation.created')
  async handleReservationCreated(payload: { reservation: any }) {
    this.logger.log(`Reservation created: ${payload.reservation.id}`);
    
    try {
      // Send confirmation email to user
      await this.emailService.sendReservationConfirmation(payload.reservation);
      
      // Notify garage owner
      await this.emailService.sendNewReservationNotification(payload.reservation);
      
      // Send SMS if phone number available
      if (payload.reservation.user?.phone) {
        await this.smsService.sendReservationConfirmation(payload.reservation);
      }
    } catch (error) {
      this.logger.error('Failed to send notifications', error);
    }
  }

  @OnEvent('quote.provided')
  async handleQuoteProvided(payload: { reservation: any }) {
    this.logger.log(`Quote provided for reservation: ${payload.reservation.id}`);
    
    try {
      await this.emailService.sendQuoteNotification(payload.reservation);
      
      if (payload.reservation.user?.phone) {
        await this.smsService.sendQuoteNotification(payload.reservation);
      }
    } catch (error) {
      this.logger.error('Failed to send quote notifications', error);
    }
  }

  @OnEvent('reservation.confirmed')
  async handleReservationConfirmed(payload: { reservation: any }) {
    this.logger.log(`Reservation confirmed: ${payload.reservation.id}`);
    
    try {
      await this.emailService.sendReservationConfirmedEmail(payload.reservation);
    } catch (error) {
      this.logger.error('Failed to send confirmation', error);
    }
  }

  @OnEvent('reservation.completed')
  async handleReservationCompleted(payload: { reservation: any }) {
    this.logger.log(`Reservation completed: ${payload.reservation.id}`);
    
    try {
      // Request review
      await this.emailService.sendReviewRequest(payload.reservation);
    } catch (error) {
      this.logger.error('Failed to send review request', error);
    }
  }

  @OnEvent('reservation.cancelled')
  async handleReservationCancelled(payload: { reservation: any }) {
    this.logger.log(`Reservation cancelled: ${payload.reservation.id}`);
    
    try {
      await this.emailService.sendCancellationNotification(payload.reservation);
    } catch (error) {
      this.logger.error('Failed to send cancellation notification', error);
    }
  }
}