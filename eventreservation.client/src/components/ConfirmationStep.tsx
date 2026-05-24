import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    Link,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import type { Reservation } from '../types';
import { api, ApiException } from '../api/client';

interface Props {
    reservation: Reservation;
    outcome: 'created' | 'updated' | 'loaded';
    onCreateNew: () => void;
    onEdit: () => void;
    onCancelled: (reservation: Reservation) => void;
}

export function ConfirmationStep({ reservation, outcome, onCreateNew, onEdit, onCancelled }: Props) {
    const [copied, setCopied] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

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
        setConfirmOpen(false);
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
    const isLoaded = outcome === 'loaded' && !cancelled;

    const heading = cancelled
        ? 'Reservation cancelled'
        : outcome === 'updated'
          ? 'Reservation updated'
          : outcome === 'loaded'
            ? 'Your reservation'
            : 'Reservation confirmed';

    return (
        <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
            {isLoaded ? (
                <EventNoteIcon sx={{ fontSize: 64, color: 'primary.main' }} />
            ) : (
                <CheckCircleIcon
                    sx={{ fontSize: 64, color: cancelled ? 'text.disabled' : 'success.main' }}
                />
            )}
            <Typography variant="h5">{heading}</Typography>

            {!cancelled && (
                <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block' }}>
                        Your reservation code
                    </Typography>
                    <Paper
                        variant="outlined"
                        sx={{
                            mt: 1,
                            pl: 3,
                            pr: 1,
                            py: 0.5,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2,
                            bgcolor: 'background.default',
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: 'monospace',
                                fontSize: '1.5rem',
                                letterSpacing: 2,
                            }}
                        >
                            {reservation.code}
                        </Typography>
                        <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
                            <IconButton onClick={handleCopy} size="small">
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Paper>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1.5, display: 'block' }}
                    >
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

            {cancelled ? (
                <Button variant="contained" onClick={onCreateNew}>
                    Create a new reservation
                </Button>
            ) : (
                <>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={onEdit}
                        >
                            Edit reservation
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => setConfirmOpen(true)}
                            disabled={cancelling}
                        >
                            Cancel reservation
                        </Button>
                    </Stack>
                    <Link
                        component="button"
                        type="button"
                        underline="hover"
                        onClick={onCreateNew}
                        sx={{ color: 'text.secondary' }}
                    >
                        or create a new reservation
                    </Link>
                </>
            )}

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Cancel reservation?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will cancel reservation <strong>{reservation.code}</strong> and
                        free up {reservation.ticketCount}{' '}
                        {reservation.ticketCount === 1 ? 'seat' : 'seats'}. This cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} disabled={cancelling}>
                        Keep reservation
                    </Button>
                    <Button color="error" onClick={handleCancel} disabled={cancelling}>
                        Cancel it
                    </Button>
                </DialogActions>
            </Dialog>
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
