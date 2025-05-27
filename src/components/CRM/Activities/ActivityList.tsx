import { format } from 'date-fns';
import { memo } from 'react';

import { Box, Chip } from '@mui/material';

import { Iconify } from '../../iconify';

interface ActivityListProps {
    stageLabels: Record<string, string>;
    employeeLabels: Record<string, string>;
    onActivityClick?: (activity: any) => void;
    activities: any[];
    isLoading: boolean;
    isError: boolean;
    onAddActivity?: () => void;
    selectedActivity?: any;
}

const ActivityList = memo(({ stageLabels, employeeLabels, onActivityClick, activities, isLoading, isError, onAddActivity, selectedActivity }: ActivityListProps) => {
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
            <Box className="bg-gray-100/40 border border-gray-200 p-3 rounded-lg max-w ">
                <h2 className="text-gray-700 font-medium text-sm mb-3">ACTIVITIES</h2>
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

    if (!activities || activities.length === 0) {
        return (
            <Box className="bg-gray-100/40 border border-gray-200 p-3 rounded-lg max-w ">
                <div className="relative mb-3">
                    <h2 className="text-gray-700 font-medium text-sm mt-0 mb-3">RECENT ACTIVITIES (0)</h2>

                    {onAddActivity && (
                        <button
                            type="button"
                            className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white border-none cursor-pointer hover:bg-blue-700 absolute top-0 right-0"
                            onClick={onAddActivity}
                            aria-label="Add activity"
                        >
                            <Iconify icon="mdi:plus" width={16} height={16} />
                        </button>
                    )}
                </div><div className="text-center p-6 rounded border border-dashed border-gray-300 bg-gray-50">
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
        <Box className="bg-gray-100/10 border border-gray-200 p-3 rounded-lg max-w-full">
            <div className="relative mb-3">
                <h2 className="text-gray-700 uppercase font-medium text-sm my-2 ml-2">
                    Recent Activities ({activities.length})
                </h2>
                {onAddActivity && (
                    <button
                        type="button"
                        className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white border-none cursor-pointer hover:bg-blue-700 absolute top-0 right-0"
                        onClick={onAddActivity}
                        aria-label="Add activity"
                    >
                        <Iconify icon="mdi:plus" width={16} height={16} />
                    </button>
                )}
            </div>
            <div className=" overflow-y-auto">
                {activities.map((activity, index) => {
                    const isLast = index === activities.length - 1;
                    const assignedTo = activity['Assigned To']?.[0];
                    const currentStage = activity['Current Stage']?.[0];
                    const newStage = activity['New Stage']?.[0];

                    return (
                        <div
                            key={activity.id}
                            className={`p-2 ${!isLast ? 'border-b border-gray-300 pb-4' : ''} cursor-pointer hover:bg-gray-100 ${selectedActivity?.id === activity.id ? 'bg-gray-100' : ''}`}
                            role="button"
                            tabIndex={index}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (onActivityClick) onActivityClick(activity);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (onActivityClick) onActivityClick(activity);
                                }
                            }}
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    {currentStage && (
                                        <Chip
                                            label={stageLabels[currentStage]}
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
                                            label={stageLabels[newStage]}
                                            size="small"
                                            color="primary"
                                        />
                                    )}
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-gray-500 text-sm">Created:</span>
                                    <span className="text-sm">
                                        {activity.Created ? formatDate(activity.Created) : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-gray-500 text-sm">Assigned To:</span>
                                    <span className="text-sm">
                                        {assignedTo ? employeeLabels[assignedTo] || '-' : '-'}
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
                                        {activity.Notes}
                                    </div>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-gray-500 text-sm">Survey Response:</span>
                                    <span
                                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold 
                                            ${activity['Survey Response'] ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}
                                    >
                                        {activity['Survey Response'] ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Box>
    );
});

export default ActivityList; 