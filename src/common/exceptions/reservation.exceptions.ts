import { HttpException, HttpStatus } from '@nestjs/common';

export class SlotNotAvailableException extends HttpException {
  constructor(timeSlot: string, remainingSlots = 0) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: 'The requested time slot is not available',
        error: 'SlotNotAvailable',
        details: {
          timeSlot,
          remainingSlots,
          suggestion: 'Please check available slots or choose a different time',
        },
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidStatusTransitionException extends HttpException {
  constructor(currentStatus: string, requestedAction: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Cannot ${requestedAction} a reservation with status ${currentStatus}`,
        error: 'InvalidStatusTransition',
        details: {
          currentStatus,
          requestedAction,
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ReservationNotFoundException extends HttpException {
  constructor(reservationId: number) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `Reservation with ID ${reservationId} not found`,
        error: 'ReservationNotFound',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class UnauthorizedReservationAccessException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You do not have permission to access this reservation',
        error: 'UnauthorizedAccess',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class PastDateReservationException extends HttpException {
  constructor(attemptedDate: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Cannot create reservation for a past date',
        error: 'PastDateReservation',
        details: {
          attemptedDate,
          currentDate: new Date().toISOString(),
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ServiceNotAvailableException extends HttpException {
  constructor(serviceId: number, garageId: number) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'The requested service is not available at this garage',
        error: 'ServiceNotAvailable',
        details: {
          serviceId,
          garageId,
        },
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OutsideBusinessHoursException extends HttpException {
  constructor(timeSlot: string, businessHours: any) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'The requested time slot is outside business hours',
        error: 'OutsideBusinessHours',
        details: {
          requestedTimeSlot: timeSlot,
          businessHours,
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
