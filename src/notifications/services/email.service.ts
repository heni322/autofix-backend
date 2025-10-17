import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendReservationConfirmation(reservation: any): Promise<void> {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to: reservation.user.email,
      subject: 'Confirmation de réservation',
      html: `
        <h1>Réservation confirmée</h1>
        <p>Bonjour ${reservation.user.firstName},</p>
        <p>Votre réservation a été créée avec succès.</p>
        <h3>Détails:</h3>
        <ul>
          <li>Garage: ${reservation.garage.name}</li>
          <li>Service: ${reservation.service.name}</li>
          <li>Date: ${new Date(reservation.timeSlot).toLocaleString('fr-FR')}</li>
          <li>Prix: ${reservation.price ? reservation.price + '€' : 'Sur devis'}</li>
        </ul>
        <p>Merci de votre confiance!</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Confirmation email sent to ${reservation.user.email}`);
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw error;
    }
  }

  async sendNewReservationNotification(reservation: any): Promise<void> {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to: reservation.garage.email || reservation.garage.owner.email,
      subject: 'Nouvelle réservation',
      html: `
        <h1>Nouvelle réservation</h1>
        <p>Une nouvelle réservation a été effectuée.</p>
        <h3>Détails:</h3>
        <ul>
          <li>Client: ${reservation.user.firstName} ${reservation.user.lastName}</li>
          <li>Service: ${reservation.service.name}</li>
          <li>Date: ${new Date(reservation.timeSlot).toLocaleString('fr-FR')}</li>
          <li>Téléphone: ${reservation.user.phone || 'N/A'}</li>
        </ul>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendQuoteNotification(reservation: any): Promise<void> {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to: reservation.user.email,
      subject: 'Votre devis est prêt',
      html: `
        <h1>Devis disponible</h1>
        <p>Bonjour ${reservation.user.firstName},</p>
        <p>Le garage ${reservation.garage.name} a préparé votre devis.</p>
        <h3>Détails:</h3>
        <ul>
          <li>Service: ${reservation.service.name}</li>
          <li>Prix: ${reservation.price}€</li>
          <li>Notes: ${reservation.garageNotes || 'N/A'}</li>
        </ul>
        <p>Connectez-vous pour accepter le devis.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendReservationConfirmedEmail(reservation: any): Promise<void> {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to: reservation.user.email,
      subject: 'Réservation confirmée',
      html: `
        <h1>Réservation confirmée</h1>
        <p>Votre réservation est maintenant confirmée!</p>
        <p>Rendez-vous le ${new Date(reservation.timeSlot).toLocaleString('fr-FR')}</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendReviewRequest(reservation: any): Promise<void> {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to: reservation.user.email,
      subject: 'Donnez votre avis',
      html: `
        <h1>Comment s'est passé votre service?</h1>
        <p>Nous aimerions connaître votre avis sur ${reservation.garage.name}</p>
        <p>Cliquez ici pour laisser un avis.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendCancellationNotification(reservation: any): Promise<void> {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to: reservation.user.email,
      subject: 'Réservation annulée',
      html: `
        <h1>Réservation annulée</h1>
        <p>Votre réservation a été annulée.</p>
        ${reservation.cancellationReason ? `<p>Raison: ${reservation.cancellationReason}</p>` : ''}
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
