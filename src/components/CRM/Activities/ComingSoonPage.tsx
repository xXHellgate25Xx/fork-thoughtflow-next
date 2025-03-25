import { Box, Container, Typography } from '@mui/material';

export default function ComingSoonPage() {
    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 10
                }}
            >
                <Typography variant="h3" component="h1" gutterBottom>
                    Coming Soon
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center">
                    This feature is currently under development. Check back later for updates!
                </Typography>
            </Box>
        </Container>
    );
} 