import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#5e35b1' },
        secondary: { main: '#26a69a' },
    },
    shape: {
        borderRadius: 10,
    },
});
