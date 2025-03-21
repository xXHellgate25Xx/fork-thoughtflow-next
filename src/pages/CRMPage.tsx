import {
    Box,
    Container,
    Typography
} from '@mui/material';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useGetProfileQuery } from 'src/libs/service/profile/profile';

export default function CRMPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { data: profileData, isLoading } = useGetProfileQuery();

    const [tab, setTab] = useState(() => {
        // Set active tab based on the current path
        if (location.pathname.includes('/crm/opportunities')) return 0;
        if (location.pathname.includes('/crm/contacts')) return 1;
        if (location.pathname.includes('/crm/leads')) return 2;
        if (location.pathname.includes('/crm/deals')) return 3;
        return 0;
    });

    // Todo: Remove this in the future if having authorization 
    // Hardcoded whitelist of authorized emails
    const whitelistedEmails = [
        'test2@email.com',
        'kate.tran@edge8.ai',
        'dave@edge8.ai',
        'dave@talentedge.io',
        'dave@edge8.co',
        'chris@investmigrate.com',
        'hoa@investmigrate.com',
        'marketing@investmigrate.com',
        'tyrone@investmigrate.com',
        'josh@investmigrate.com'
        // Add more emails as needed
    ];

    // Check authorization directly without useEffect
    const userEmail = profileData?.data?.[0]?.email || '';
    const isAuthorized = whitelistedEmails.includes(userEmail);

    const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);

        // Navigate to the corresponding sub-route
        switch (newValue) {
            case 0:
                navigate('/crm/opportunities');
                break;
            case 1:
                navigate('/crm/contacts');
                break;
            case 2:
                navigate('/crm/leads');
                break;
            case 3:
                navigate('/crm/deals');
                break;
            default:
                navigate('/crm/opportunities');
        }
    };

    // Show loading while fetching profile data
    if (isLoading) {
        return (
            <Container maxWidth="xl" sx={{ py: 5 }}>
                <Box textAlign="center" py={5}>
                    <Typography variant="h5">
                        Loading...
                    </Typography>
                </Box>
            </Container>
        );
    }

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
                {/* <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Customer Relationship Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your sales pipeline, contacts, and customer relationships
                    </Typography>
                </Box>

                <Box sx={{ mb: 5 }}>
                    <Tabs
                        value={tab}
                        onChange={handleChangeTab}
                        sx={{
                            px: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: theme => theme.customShadows.z8,
                        }}
                    >
                        <Tab label="Opportunities" />
                        <Tab label="Contacts" />
                        <Tab label="Leads" />
                        <Tab label="Deals" />
                    </Tabs>
                </Box> */}
                <Outlet />
            </Container>
        </>
    );
} 