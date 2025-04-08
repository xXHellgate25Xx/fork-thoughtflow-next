import { format } from 'date-fns';
import { useEffect } from 'react';

import { Box, Chip } from '@mui/material';

import { useActivityLogs } from '../../../hooks/tablehooks';
import { Iconify } from '../../iconify';

interface ActivityListProps {
    prospectId: string;
    statusLabels: Record<string, string>;
    explanationLabels: Record<string, Record<string, string>>;
    employeeMap: Record<string, string>;
}

export default function ActivityList({ statusLabels, explanationLabels, prospectId, employeeMap }: ActivityListProps) {
    const { records: activities, isLoading, isError, refetch } = useActivityLogs({
        filters: [{
            field: 'Prospect',
            operator: 'eq',
            value: prospectId
        }],
        sort: [{
            field: 'Created',
            direction: 'desc'
        }]
    });

    // Refresh activities when prospectId changes
    useEffect(() => {
        if (prospectId) {
            refetch();
        }
    }, [prospectId]); // Only depend on prospectId, not refetch

    // Format date to a readable format
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMMM d, yyyy');
        } catch (e) {
            return dateString || 'N/A';
        }
    };

    if (isError) {
        return (
            <Box className="p-4 text-center text-red-500">
                Error loading activities
            </Box>
        );
    }

    if (isLoading) {
        return (
            <Box className="bg-gray-100/40 border border-gray-200 p-6 rounded-lg max-w ">
                <h2 className="text-gray-700 font-medium text-sm mb-4">ACTIVITIES</h2>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border-b border-gray-200 pb-4 mb-4">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </Box>
        );
    }

    if (!activities?.length) {
        return (
            <Box className="bg-gray-100/40 border border-gray-200 p-6 rounded-lg max-w ">
                <h2 className="text-gray-700 font-medium text-sm mt-0 mb-4">RECENT ACTIVITIES (0)</h2>
                <div className="text-center p-6 rounded border border-dashed border-gray-300 bg-gray-50">
                    <div className="mb-2 text-gray-400">
                        <Iconify
                            icon="mdi:calendar-blank"
                            width={32}
                            height={32}
                        />
                    </div>
                    <p className="text-gray-500 text-sm">
                        No activity records found
                    </p>
                </div>
            </Box>
        );
    }

    return (
        <Box className="bg-gray-100/10 border border-gray-200 p-6 rounded-lg max-w-full">
            <h2 className="text-gray-700 uppercase font-medium text-sm mt-0 mb-4">
                Recent Activities ({activities.length})
            </h2>

            <div className="space-y-4 overflow-y-auto">
                {activities.map((activity, index) => {
                    const isLast = index === activities.length - 1;
                    const assignedTo = activity['Assigned To']?.[0];
                    const currentStage = activity['Current Stage']?.[0];
                    const newStage = activity['New Stage']?.[0];

                    return (
                        <div
                            key={activity.id}
                            className={`${!isLast ? 'border-b border-gray-300 pb-4' : ''}`}
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    {currentStage && (
                                        <Chip
                                            label={statusLabels[currentStage]}
                                            size="small"
                                            color="default"
                                        />
                                    )}
                                    {currentStage && newStage && (
                                        <Iconify
                                            icon="mdi:arrow-right"
                                            width={20}
                                            height={20}
                                            className="text-gray-400"
                                        />
                                    )}
                                    {newStage && (
                                        <Chip
                                            label={statusLabels[newStage]}
                                            size="small"
                                            color="primary"
                                        />
                                    )}
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-gray-500 text-sm">Log Date:</span>
                                    <span className="text-sm">
                                        {activity['Log Date'] ? formatDate(activity['Log Date']) : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-gray-500 text-sm">Assigned To:</span>
                                    <span className="text-sm">
                                        {assignedTo ? employeeMap[assignedTo] || '-' : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-gray-500 text-sm">Next Contact Date:</span>
                                    <span className="text-sm">
                                        {activity['Next Contact Date'] ? formatDate(activity['Next Contact Date']) : '-'}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <div className="text-gray-500 text-sm mb-1">Notes:</div>
                                    <div className="text-sm pl-0">
                                        {activity.Note}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Box>
    );
} 