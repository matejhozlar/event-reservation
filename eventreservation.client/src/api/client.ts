import type { ApiError, EventConfig, Reservation, ReservationInput } from '../types';

export class ApiException extends Error {
    status: number;
    body: ApiError;

    constructor(status: number, body: ApiError) {
        super(body.error || `Request failed with status ${status}`);
        this.status = status;
        this.body = body;
    }
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const response = await fetch(input, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
    });

    if (!response.ok) {
        let body: ApiError = { error: response.statusText };
        try {
            body = await response.json();
        } catch {
            // ignore — keep default body
        }
        throw new ApiException(response.status, body);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

export const api = {
    getConfig: () => request<EventConfig>('/api/config'),
    getReservation: (code: string) => request<Reservation>(`/api/reservations/${encodeURIComponent(code)}`),
    createReservation: (input: ReservationInput) =>
        request<Reservation>('/api/reservations', {
            method: 'POST',
            body: JSON.stringify(input),
        }),
    updateReservation: (code: string, input: ReservationInput) =>
        request<Reservation>(`/api/reservations/${encodeURIComponent(code)}`, {
            method: 'PUT',
            body: JSON.stringify(input),
        }),
    cancelReservation: (code: string) =>
        request<Reservation>(`/api/reservations/${encodeURIComponent(code)}`, {
            method: 'DELETE',
        }),
};
