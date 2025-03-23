import { format } from 'date-fns';
import { useEffect, useMemo } from 'react';

import { alpha, Box, Chip, Paper, Skeleton, Typography, useTheme } from '@mui/material';

import { useActivityLogs } from '../hooks/tablehooks';
import { Iconify } from './iconify';

interface ActivityListProps {
    prospectId: string;
    maxHeight?: number | string;
}

export default function ActivityList({ prospectId, maxHeight = 300 }: ActivityListProps) {
    const theme = useTheme();
    const { records: activities, isLoading, isError, refetch } = useActivityLogs({
        filters: [{
            field: 'Prospect',
            operator: 'custom',
            value: `FIND('${prospectId}', ARRAYJOIN({Prospect}, ''))`
        }],
        // sort: [{ field: 'Log Date', direction: 'desc' }]
    });

    // Refresh activities when prospectId changes
    useEffect(() => {
        if (prospectId) {
            refetch();
        }
    }, [prospectId, refetch]);

    // Format date to a readable format
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch (e) {
            return dateString || 'N/A';
        }
    };

    // Get status badges for stage transitions
    const getStatusBadge = (status: string) => (
        <Chip
            size="small"
            label={status}
            sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 500,
                borderRadius: '4px',
                fontSize: '0.75rem',
            }}
        />
    );

    // Group activities by date
    const groupedActivities = useMemo(() => {
        if (!activities?.length) return {};

        return activities.reduce((acc: Record<string, any[]>, activity) => {
            const date = activity['Log Date'] || activity['Next Contact Date'];
            const formattedDate = date ? formatDate(date) : 'N/A';

            if (!acc[formattedDate]) {
                acc[formattedDate] = [];
            }

            acc[formattedDate].push(activity);
            return acc;
        }, {});
    }, [activities]);

    if (isError) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="error">Error loading activities</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxHeight, overflowY: 'auto', pr: 1 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Activity History
            </Typography>

            {isLoading ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, i) => (
                    <Box key={`skeleton-${i}`} sx={{ mb: 2 }}>
                        <Skeleton variant="text" width="30%" height={24} />
                        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1, mt: 1 }} />
                    </Box>
                ))
            ) : !activities?.length ? (
                // No activities found
                <Box
                    sx={{
                        p: 3,
                        textAlign: 'center',
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.background.default, 0.5),
                        border: `1px dashed ${alpha(theme.palette.divider, 0.5)}`,
                    }}
                >
                    <Iconify
                        icon="mdi:calendar-blank"
                        width={32}
                        height={32}
                        sx={{
                            color: alpha(theme.palette.text.secondary, 0.4),
                            mb: 1
                        }}
                    />
                    <Typography color="textSecondary" variant="body2">
                        No activity records found
                    </Typography>
                </Box>
            ) : (
                // Activity list grouped by date
                Object.entries(groupedActivities).map(([date, dateActivities]) => (
                    <Box key={date} sx={{ mb: 3 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                mb: 1.5,
                                color: theme.palette.text.secondary,
                                fontWeight: 500
                            }}
                        >
                            {date}
                        </Typography>

                        {dateActivities.map((activity, index) => (
                            <Paper
                                key={activity.id}
                                elevation={0}
                                sx={{
                                    mb: 2,
                                    p: 2,
                                    borderRadius: 1,
                                    backgroundColor: alpha(theme.palette.background.default, 0.7),
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.background.default, 0.9),
                                    }
                                }}
                            >
                                <Box display="flex" alignItems="center" mb={1}>
                                    {activity['Current Stage']?.length > 0 && activity['New Stage']?.length > 0 && (
                                        <>
                                            {getStatusBadge(activity['Current Stage'][0])}
                                            <Iconify
                                                icon="mdi:arrow-right"
                                                width={20}
                                                height={20}
                                                sx={{ mx: 1, color: theme.palette.text.secondary }}
                                            />
                                            {getStatusBadge(activity['New Stage'][0])}
                                        </>
                                    )}
                                    {activity['Current Stage']?.length > 0 && (!activity['New Stage'] || !activity['New Stage'].length) && (
                                        <>{getStatusBadge(activity['Current Stage'][0])}</>
                                    )}
                                    {(!activity['Current Stage'] || !activity['Current Stage'].length) && activity['New Stage']?.length > 0 && (
                                        <>{getStatusBadge(activity['New Stage'][0])}</>
                                    )}
                                </Box>

                                {activity.Note && (
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                                        {activity.Note}
                                    </Typography>
                                )}

                                <Box display="flex" justifyContent="space-between" mt={1}>
                                    {activity['Next Contact Date'] && (
                                        <Typography variant="caption" color="textSecondary">
                                            Next contact: {formatDate(activity['Next Contact Date'])}
                                        </Typography>
                                    )}
                                    <Typography variant="caption" color="textSecondary" sx={{ ml: 'auto' }}>
                                        {format(new Date(activity.createdTime), 'h:mm a')}
                                    </Typography>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                ))
            )}
        </Box>
    );
} 