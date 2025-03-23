import { format } from 'date-fns';
import ActivityList from './ActivityList';
import { Iconify } from './iconify';

interface Activity {
    id: string;
    title: string;
    date: string;
    status?: string;
    owner: string;
    isCompleted?: boolean;
}

interface OpportunityDetailsProps {
    opportunity: any; // Accept any to support both custom and CRM opportunity formats
    activities?: Activity[];
    useExistingActivityList?: boolean;
    prospectId?: string;
    maxActivityHeight?: number | string;
    formatCurrency?: (value: any) => string;
    statusLabels?: Record<string, string>;
    onAddActivity?: () => void;
}

export default function OpportunityDetails({
    opportunity,
    activities = [],
    useExistingActivityList = false,
    prospectId = '',
    maxActivityHeight = 400,
    formatCurrency: externalFormatCurrency,
    statusLabels = {},
    onAddActivity
}: OpportunityDetailsProps) {
    // Internal formatCurrency if external isn't provided
    const formatCurrency = (value: number | string) => {
        if (externalFormatCurrency) {
            return externalFormatCurrency(value);
        }
        if (!value) return '$0';
        return `$${Number(value).toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMMM d, yyyy');
        } catch (e) {
            return dateString || 'N/A';
        }
    };

    // Get actual prospect ID
    const actualProspectId = prospectId || opportunity['Prospect ID'] || opportunity.id || '';

    const getStatusChip = (status: string) => {
        // Base classes for the status chip
        const baseClasses = "inline-flex items-center px-2 py-1 text-xs font-medium rounded";

        // Determine the color based on status text
        const displayStatus = statusLabels[status] || status;

        let colorClasses = "bg-blue-100 text-blue-700";

        if (displayStatus?.toLowerCase().includes('progress')) {
            colorClasses = "bg-blue-100 text-blue-700";
        } else if (displayStatus?.toLowerCase().includes('complete')) {
            colorClasses = "bg-green-100 text-green-700";
        }

        return (
            <span className={`${baseClasses} ${colorClasses}`}>
                {displayStatus}
            </span>
        );
    };

    const renderDetailItem = (label: string, value: string | number | React.ReactNode) => (
        <div className="mb-5">
            <div className="text-gray-500 text-xs uppercase font-normal tracking-wide mb-1">
                {label}
            </div>
            {typeof value === 'string' || typeof value === 'number' ? (
                <div className="text-gray-900 text-sm">
                    {value || '-'}
                </div>
            ) : (
                value
            )}
        </div>
    );

    // Render opportunity details section
    return (
        <div className="text-sm">
            <div className="flex items-center mb-6 justify-end">
                <button
                    type="button"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white border-none cursor-pointer hover:bg-blue-700"
                    onClick={onAddActivity}
                >
                    <Iconify icon="mdi:plus" width={20} height={20} />
                </button>
            </div>

            <div className="mb-8">
                {/* Support both custom and CRM formats */}
                {renderDetailItem('OPPORTUNITY NAME', opportunity.name || opportunity['Last Name'] || '')}
                {renderDetailItem('CONTACT', opportunity.contact || opportunity['Last Name'] || '')}
                {renderDetailItem('COMPANY', opportunity.company || opportunity.Company || '')}
                {(opportunity.Email || opportunity.Email) && renderDetailItem('EMAIL', opportunity.Email || opportunity.Email)}
                {(opportunity.Phone || opportunity.Phone) && renderDetailItem('PHONE', opportunity.Phone || opportunity.Phone)}
                {(opportunity['Job Title'] || opportunity.jobTitle) && renderDetailItem('JOB TITLE', opportunity['Job Title'] || opportunity.jobTitle)}
                {renderDetailItem('VALUE', formatCurrency(opportunity.value || opportunity['Deal Value'] || 0))}
                {renderDetailItem('CURRENT STAGE', getStatusChip(opportunity.status || opportunity['Current Stage (linked)'] || ''))}
                {(opportunity['Source Channel'] || opportunity.sourceChannel) && renderDetailItem('SOURCE CHANNEL', opportunity['Source Channel'] || opportunity.sourceChannel)}
                {renderDetailItem('EXPECTED CLOSE DATE', formatDate(opportunity.expectedCloseDate || opportunity['Expected Close Date'] || ''))}
                {(opportunity['General Notes'] || opportunity.generalNotes) && renderDetailItem('GENERAL NOTES', opportunity['General Notes'] || opportunity.generalNotes)}
                {opportunity.owner && renderDetailItem('OPPORTUNITY OWNER', opportunity.owner)}
            </div>

            <hr className="my-6 border-t border-gray-200" />

            {useExistingActivityList && actualProspectId ? (
                // Use the existing ActivityList component
                <ActivityList prospectId={actualProspectId} maxHeight={maxActivityHeight} />
            ) : (
                // Use the custom activities list
                <>
                    <h3 className="font-semibold mb-4 text-base">
                        ACTIVITIES ({activities.length})
                    </h3>

                    {activities.length === 0 ? (
                        <div className="p-6 text-center rounded border border-dashed border-gray-300 bg-gray-50">
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
                    ) : (
                        <div className="overflow-y-auto" style={{ maxHeight: `${maxActivityHeight}px` }}>
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className={`mb-3 p-4 rounded border border-gray-200 ${activity.isCompleted
                                        ? 'bg-gray-50'
                                        : 'bg-white'
                                        } hover:bg-gray-100`}
                                >
                                    <h4 className="mb-1 font-semibold text-sm">
                                        {activity.title}
                                    </h4>
                                    <p className="text-gray-500 text-xs mb-2">
                                        {formatDate(activity.date)} • Owner: {activity.owner}
                                    </p>
                                    {activity.status && (
                                        <div className="mt-2">
                                            {getStatusChip(activity.status)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
} 