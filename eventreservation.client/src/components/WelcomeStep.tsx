import { Box, Button, Stack, Typography } from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import KeyIcon from '@mui/icons-material/Key';
import AddIcon from '@mui/icons-material/Add';
import type { EventConfig } from '../types';

interface Props {
    config: EventConfig;
    onStartNew: () => void;
    onEnterCode: () => void;
}

export function WelcomeStep({ config, onStartNew, onEnterCode }: Props) {
    const eventDate = new Date(config.eventDateUtc);

    return (
        <Stack spacing={4} sx={{ alignItems: 'center', textAlign: 'center' }}>
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
                    {config.remainingCapacity} seats available
                </Typography>
            </Box>

            <Stack spacing={2} sx={{ width: '100%', maxWidth: 320 }}>
                <Button
                    size="large"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onStartNew}
                    disabled={config.remainingCapacity <= 0}
                >
                    Make a new reservation
                </Button>
                <Button
                    size="large"
                    variant="outlined"
                    startIcon={<KeyIcon />}
                    onClick={onEnterCode}
                >
                    I have a reservation code
                </Button>
            </Stack>
        </Stack>
    );
}
