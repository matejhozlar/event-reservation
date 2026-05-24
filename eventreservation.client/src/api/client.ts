import type { ApiError, EventConfig, JournalEntry, Reservation, ReservationInput } from '../types';

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
            const raw = await response.json();
            body = normalizeError(raw, response.statusText);
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

function normalizeError(raw: unknown, fallback: string): ApiError {
    if (raw && typeof raw === 'object') {
        const obj = raw as Record<string, unknown>;
        if (typeof obj.error === 'string') {
            const out: ApiError = { error: obj.error };
            if (typeof obj.remainingCapacity === 'number') {
                out.remainingCapacity = obj.remainingCapacity;
            }
            return out;
        }
        if (obj.errors && typeof obj.errors === 'object') {
            const messages: string[] = [];
            for (const value of Object.values(obj.errors as Record<string, unknown>)) {
                if (Array.isArray(value)) {
                    for (const v of value) {
                        if (typeof v === 'string') messages.push(v);
                    }
                } else if (typeof value === 'string') {
                    messages.push(value);
                }
            }
            if (messages.length > 0) {
                return { error: messages.join(' ') };
            }
        }
        if (typeof obj.title === 'string') {
            return { error: obj.title };
        }
    }
    return { error: fallback };
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
    getJournal: () => request<JournalEntry[]>('/api/journal'),
};
