export class ReservationCreatedEvent {
  constructor(public readonly reservation: any) {}
}

export class QuoteProvidedEvent {
  constructor(public readonly reservation: any) {}
}

export class ReservationConfirmedEvent {
  constructor(public readonly reservation: any) {}
}

export class ReservationCompletedEvent {
  constructor(public readonly reservation: any) {}
}

export class ReservationCancelledEvent {
  constructor(public readonly reservation: any) {}
}
