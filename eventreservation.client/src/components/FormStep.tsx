import { useState } from 'react';
import {
    Alert,
    Button,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import type { EventConfig, Reservation, ReservationInput } from '../types';
import { api, ApiException } from '../api/client';

interface Props {
    config: EventConfig;
    existing: Reservation | null;
    onCompleted: (reservation: Reservation, outcome: 'created' | 'updated') => void;
    onBack: () => void;
}

interface FieldErrors {
    email?: string;
    phone?: string;
    ticketCount?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[+]?[\d\s()-]{6,}$/;

export function FormStep({ config, existing, onCompleted, onBack }: Props) {
    const [email, setEmail] = useState(existing?.email ?? '');
    const [phone, setPhone] = useState(existing?.phone ?? '');
    const [ticketCount, setTicketCount] = useState<string>(
        existing ? String(existing.ticketCount) : '1',
    );
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const isEdit = existing !== null;
    const max = config.maxTicketsPerReservation;

    const isDirty =
        !isEdit ||
        email.trim() !== existing!.email ||
        phone.trim() !== existing!.phone ||
        Number(ticketCount) !== existing!.ticketCount;

    function validate(): FieldErrors {
        const next: FieldErrors = {};
        if (!email.trim()) next.email = 'Email is required.';
        else if (!emailRegex.test(email.trim())) next.email = 'Enter a valid email address.';

        if (!phone.trim()) next.phone = 'Phone is required.';
        else if (!phoneRegex.test(phone.trim())) next.phone = 'Enter a valid phone number.';

        const n = Number(ticketCount);
        if (!Number.isInteger(n)) next.ticketCount = 'Enter a whole number.';
        else if (n < 1) next.ticketCount = 'At least 1 ticket.';
        else if (n > max) next.ticketCount = `Maximum ${max} tickets per reservation.`;

        return next;
    }

    async function handleSubmit() {
        const next = validate();
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        const input: ReservationInput = {
            email: email.trim(),
            phone: phone.trim(),
            ticketCount: Number(ticketCount),
        };

        setSubmitting(true);
        setSubmitError(null);
        try {
            const result = isEdit
                ? await api.updateReservation(existing!.code, input)
                : await api.createReservation(input);
            onCompleted(result, isEdit ? 'updated' : 'created');
        } catch (err) {
            if (err instanceof ApiException) {
                setSubmitError(err.body.error);
            } else {
                setSubmitError('Something went wrong. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Stack spacing={3}>
            <Typography variant="h5">
                {isEdit ? 'Edit your reservation' : 'Your details'}
            </Typography>

            <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email}
                fullWidth
                required
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <EmailIcon color="action" />
                            </InputAdornment>
                        ),
                    },
                }}
            />

            <TextField
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={Boolean(errors.phone)}
                helperText={errors.phone ?? 'Digits, spaces, parentheses, dashes and an optional leading +.'}
                fullWidth
                required
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <PhoneIcon color="action" />
                            </InputAdornment>
                        ),
                    },
                }}
            />

            <TextField
                label="Number of tickets"
                type="number"
                value={ticketCount}
                onChange={(e) => setTicketCount(e.target.value)}
                error={Boolean(errors.ticketCount)}
                helperText={errors.ticketCount ?? `Between 1 and ${max}.`}
                fullWidth
                required
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <ConfirmationNumberIcon color="action" />
                            </InputAdornment>
                        ),
                    },
                    htmlInput: { min: 1, max, step: 1 },
                }}
            />

            {submitError && <Alert severity="error">{submitError}</Alert>}

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                <Button onClick={onBack} disabled={submitting}>
                    Back
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting || !isDirty}
                >
                    {isEdit ? 'Save changes' : 'Confirm reservation'}
                </Button>
            </Stack>
        </Stack>
    );
}
