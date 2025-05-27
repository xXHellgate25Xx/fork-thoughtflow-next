import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';

import {
    Box,
    Container,
    Typography
} from '@mui/material';
import { useCRMAuth } from 'src/hooks/useCRMAuth';


export default function CRMPage() {
    // Hardcoded whitelist of account IDs eligible for CRM feature
    const whitelistedAccountIds = [
        '5b7a773e-6095-4257-aff0-34ba1a99fe24',  // Invest Migrate
        'cd65c956-5d2d-45d7-aea8-f5e0e29cad8d'  // Edge8
    ]
    // Get accountId from local storage
    const accountId = localStorage.getItem('accountId') || '';
    const isAuthorized = whitelistedAccountIds.includes(accountId);

    useCRMAuth();
    // If user is not authorized, show access denied message
    if (!isAuthorized) {
        return (
            <Container maxWidth="xl" sx={{ py: 5 }}>
                <Box textAlign="center" py={5}>
                    <Typography variant="h4" color="error" gutterBottom>
                        Access Denied
                    </Typography>
                    <Typography variant="body1">
                        {`You don't have permission to access the CRM system. Please contact your administrator.`}
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <>
            <Helmet>
                <title>CRM | ThoughtFlow</title>
            </Helmet>

            <Container maxWidth="xl">
                <Outlet />
            </Container>
        </>
    );
} 