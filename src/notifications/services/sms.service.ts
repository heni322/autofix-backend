import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor() {}

  sendReservationConfirmation(reservation: any): void {
    const message = `Réservation confirmée chez ${reservation.garage.name} le ${new Date(reservation.timeSlot).toLocaleDateString('fr-FR')}`;

    this.logger.log(`SMS sent to ${reservation.user.phone}: ${message}`);
    // Implement actual SMS sending with Twilio, AWS SNS, etc.
  }

  sendQuoteNotification(reservation: any): void {
    const message = `Votre devis de ${reservation.price}€ est prêt chez ${reservation.garage.name}`;

    this.logger.log(`SMS sent to ${reservation.user.phone}: ${message}`);
  }
}
