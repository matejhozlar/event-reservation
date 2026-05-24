import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    CircularProgress,
    Container,
    Paper,
    Step,
    StepLabel,
    Stepper,
} from '@mui/material';
import type { EventConfig, Reservation } from '../types';
import { api } from '../api/client';
import { WelcomeStep } from './WelcomeStep';
import { CodeEntryStep } from './CodeEntryStep';
import { FormStep } from './FormStep';
import { ConfirmationStep } from './ConfirmationStep';

type StepIndex = 0 | 1 | 2;
type WelcomeMode = 'choose' | 'enterCode';

const steps = ['Welcome', 'Your details', 'Confirmation'];

export function ReservationWizard() {
    const [step, setStep] = useState<StepIndex>(0);
    const [welcomeMode, setWelcomeMode] = useState<WelcomeMode>('choose');
    const [config, setConfig] = useState<EventConfig | null>(null);
    const [configError, setConfigError] = useState<string | null>(null);
    const [existing, setExisting] = useState<Reservation | null>(null);
    const [result, setResult] = useState<Reservation | null>(null);
    const [outcome, setOutcome] = useState<'created' | 'updated' | 'loaded'>('created');

    useEffect(() => {
        api.getConfig()
            .then(setConfig)
            .catch(() => setConfigError('Could not load event configuration. Is the API running?'));
    }, []);

    function reset() {
        setExisting(null);
        setResult(null);
        setWelcomeMode('choose');
        setStep(0);
        api.getConfig().then(setConfig).catch(() => undefined);
    }

    if (configError) {
        return (
            <Container maxWidth="sm" sx={{ py: 6 }}>
                <Alert severity="error">{configError}</Alert>
            </Container>
        );
    }

    if (!config) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 6 }}>
            <Stepper activeStep={step} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Paper elevation={2} sx={{ p: { xs: 3, sm: 5 } }}>
                {step === 0 && welcomeMode === 'choose' && (
                    <WelcomeStep
                        config={config}
                        onStartNew={() => {
                            setExisting(null);
                            setStep(1);
                        }}
                        onEnterCode={() => setWelcomeMode('enterCode')}
                    />
                )}
                {step === 0 && welcomeMode === 'enterCode' && (
                    <CodeEntryStep
                        onLoaded={(reservation) => {
                            setExisting(reservation);
                            setResult(reservation);
                            setOutcome('loaded');
                            setStep(2);
                        }}
                        onBack={() => setWelcomeMode('choose')}
                    />
                )}
                {step === 1 && (
                    <FormStep
                        config={config}
                        existing={existing}
                        onCompleted={(reservation, completedOutcome) => {
                            setResult(reservation);
                            setOutcome(completedOutcome);
                            setStep(2);
                        }}
                        onBack={() => {
                            setWelcomeMode('choose');
                            setStep(0);
                        }}
                    />
                )}
                {step === 2 && result && (
                    <ConfirmationStep
                        reservation={result}
                        outcome={outcome}
                        onCreateNew={reset}
                        onEdit={() => {
                            setExisting(result);
                            setStep(1);
                        }}
                        onCancelled={(reservation) => setResult(reservation)}
                    />
                )}
            </Paper>
        </Container>
    );
}
