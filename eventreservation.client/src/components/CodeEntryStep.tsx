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
import KeyIcon from '@mui/icons-material/Key';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { Reservation } from '../types';
import { api, ApiException } from '../api/client';

interface Props {
    onLoaded: (reservation: Reservation) => void;
    onBack: () => void;
}

export function CodeEntryStep({ onLoaded, onBack }: Props) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLoad() {
        setLoading(true);
        setError(null);
        try {
            const reservation = await api.getReservation(code.trim().toUpperCase());
            onLoaded(reservation);
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

    const trimmed = code.trim();

    return (
        <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <KeyIcon sx={{ fontSize: 56, color: 'primary.main' }} />
            <Box>
                <Typography variant="h5" gutterBottom>
                    Enter your reservation code
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Use the code you received when you made the reservation.
                </Typography>
            </Box>

            <TextField
                fullWidth
                autoFocus
                label="Reservation code"
                placeholder="EVT-XXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && trimmed && !loading) handleLoad();
                }}
                autoComplete="off"
                sx={{ maxWidth: 360 }}
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

            {error && (
                <Alert severity="error" sx={{ width: '100%', maxWidth: 360 }}>
                    {error}
                </Alert>
            )}

            <Stack
                direction="row"
                spacing={2}
                sx={{ width: '100%', maxWidth: 360, justifyContent: 'space-between' }}
            >
                <Button startIcon={<ArrowBackIcon />} onClick={onBack} disabled={loading}>
                    Back
                </Button>
                <Button
                    variant="contained"
                    onClick={handleLoad}
                    disabled={!trimmed || loading}
                >
                    Load reservation
                </Button>
            </Stack>
        </Stack>
    );
}
