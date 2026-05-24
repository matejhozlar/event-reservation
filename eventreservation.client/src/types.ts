export interface EventConfig {
    eventDateUtc: string;
    capacity: number;
    maxTicketsPerReservation: number;
    remainingCapacity: number;
}

export interface Reservation {
    code: string;
    email: string;
    phone: string;
    ticketCount: number;
    createdAt: string;
    updatedAt: string;
    isCancelled: boolean;
}

export interface ReservationInput {
    email: string;
    phone: string;
    ticketCount: number;
}

export interface ApiError {
    error: string;
    remainingCapacity?: number;
}
