import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Divider,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import type { Reservation } from '../types';
import { api, ApiException } from '../api/client';

interface Props {
    reservation: Reservation;
    onStartOver: () => void;
    onCancelled: (reservation: Reservation) => void;
}

export function ConfirmationStep({ reservation, onStartOver, onCancelled }: Props) {
    const [copied, setCopied] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(reservation.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard may be unavailable on http
        }
    }

    async function handleCancel() {
        if (!confirm('Cancel this reservation? This cannot be undone.')) return;
        setCancelling(true);
        setError(null);
        try {
            const updated = await api.cancelReservation(reservation.code);
            onCancelled(updated);
        } catch (err) {
            setError(err instanceof ApiException ? err.body.error : 'Could not cancel reservation.');
        } finally {
            setCancelling(false);
        }
    }

    const cancelled = reservation.isCancelled;

    return (
        <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <CheckCircleIcon
                sx={{ fontSize: 64, color: cancelled ? 'text.disabled' : 'success.main' }}
            />
            <Typography variant="h5">
                {cancelled ? 'Reservation cancelled' : 'Reservation confirmed'}
            </Typography>

            {!cancelled && (
                <Box>
                    <Typography variant="overline" color="text.secondary">
                        Your reservation code
                    </Typography>
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Paper
                            variant="outlined"
                            sx={{
                                px: 3,
                                py: 1.5,
                                fontFamily: 'monospace',
                                fontSize: '1.5rem',
                                letterSpacing: 2,
                                bgcolor: 'background.default',
                            }}
                        >
                            {reservation.code}
                        </Paper>
                        <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
                            <IconButton onClick={handleCopy}>
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Save this code to edit or cancel your reservation later.
                    </Typography>
                </Box>
            )}

            <Paper variant="outlined" sx={{ p: 2, width: '100%', maxWidth: 420, textAlign: 'left' }}>
                <Stack spacing={1.5}>
                    <Row label="Email" value={reservation.email} />
                    <Divider />
                    <Row label="Phone" value={reservation.phone} />
                    <Divider />
                    <Row label="Tickets" value={String(reservation.ticketCount)} />
                </Stack>
            </Paper>

            {error && <Alert severity="error">{error}</Alert>}

            <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={onStartOver}>
                    Start over
                </Button>
                {!cancelled && (
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={handleCancel}
                        disabled={cancelling}
                    >
                        Cancel reservation
                    </Button>
                )}
            </Stack>
        </Stack>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body2">{value}</Typography>
        </Stack>
    );
}
