import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import KeyIcon from '@mui/icons-material/Key';
import type { EventConfig, Reservation } from '../types';
import { api, ApiException } from '../api/client';

interface Props {
    config: EventConfig;
    onStartNew: () => void;
    onLoadedExisting: (reservation: Reservation) => void;
}

export function WelcomeStep({ config, onStartNew, onLoadedExisting }: Props) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const eventDate = new Date(config.eventDateUtc);

    async function handleLoad() {
        setLoading(true);
        setError(null);
        try {
            const reservation = await api.getReservation(code.trim().toUpperCase());
            if (reservation.isCancelled) {
                setError('This reservation has been cancelled and cannot be modified.');
                return;
            }
            onLoadedExisting(reservation);
        } catch (err) {
            if (err instanceof ApiException && err.status === 404) {
                setError('No reservation found for that code.');
            } else {
                setError('Could not load reservation. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <EventAvailableIcon sx={{ fontSize: 64, color: 'primary.main' }} />
            <Box>
                <Typography variant="h4" gutterBottom>
                    Welcome to the New Year's Eve Gala
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {eventDate.toLocaleString(undefined, {
                        dateStyle: 'full',
                        timeStyle: 'short',
                    })}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {config.remainingCapacity} of {config.capacity} seats still available
                </Typography>
            </Box>

            <Button
                size="large"
                variant="contained"
                onClick={onStartNew}
                disabled={config.remainingCapacity <= 0}
                sx={{ minWidth: 260 }}
            >
                Make a new reservation
            </Button>

            <Box sx={{ width: '100%', maxWidth: 420 }}>
                <Typography variant="overline" color="text.secondary">
                    Already have a reservation code?
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Reservation code"
                        placeholder="EVT-XXXXX"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && code.trim()) handleLoad();
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <KeyIcon color="action" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <Button
                        variant="outlined"
                        onClick={handleLoad}
                        disabled={!code.trim() || loading}
                    >
                        Load
                    </Button>
                </Stack>
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Box>
        </Stack>
    );
}
