import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Link,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { JournalEntry } from '../types';
import { api } from '../api/client';

export function JournalPage() {
    const [entries, setEntries] = useState<JournalEntry[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getJournal();
            setEntries(data);
        } catch {
            setError('Could not load journal.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        api.getJournal()
            .then(setEntries)
            .catch(() => setError('Could not load journal.'));
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}
            >
                <Box>
                    <Link href="/" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        <ArrowBackIcon fontSize="small" /> Back to reservations
                    </Link>
                    <Typography variant="h4" sx={{ mt: 1 }}>
                        Journal
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Every reservation create / update / cancel, with the caller's IP and User-Agent.
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={load}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {entries === null && loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <CircularProgress />
                </Box>
            ) : entries && entries.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No journal entries yet.</Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Timestamp (UTC)</TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>Reservation</TableCell>
                                <TableCell>IP</TableCell>
                                <TableCell>User-Agent</TableCell>
                                <TableCell>Payload</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {entries?.map((entry) => (
                                <TableRow key={entry.id} hover>
                                    <TableCell sx={{ whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 12 }}>
                                        {new Date(entry.timestamp).toISOString().replace('T', ' ').slice(0, 19)}
                                    </TableCell>
                                    <TableCell>
                                        <ActionChip action={entry.action} />
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'monospace' }}>{entry.reservationCode}</TableCell>
                                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                                        {entry.ipAddress ?? '—'}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            maxWidth: 240,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            fontSize: 12,
                                        }}
                                        title={entry.userAgent ?? ''}
                                    >
                                        {entry.userAgent ?? '—'}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            maxWidth: 320,
                                            fontFamily: 'monospace',
                                            fontSize: 12,
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {entry.payloadJson ?? '—'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}

function ActionChip({ action }: { action: JournalEntry['action'] }) {
    const color: 'success' | 'info' | 'error' =
        action === 'Create' ? 'success' : action === 'Update' ? 'info' : 'error';
    return <Chip size="small" label={action} color={color} variant="outlined" />;
}
