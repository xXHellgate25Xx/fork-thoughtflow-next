import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { varAlpha } from 'src/theme/styles';

export const LoadingFallback = () => (
    <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flex="1 1 auto"
        height="100vh"
        position="absolute"
        top="0"
        left="0"
        width="100%"
    >
        <LinearProgress
            sx={{
                width: 1,
                maxWidth: 320,
                bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
                [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
            }}
        />
    </Box>
); 