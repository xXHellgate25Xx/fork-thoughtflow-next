import { format } from 'date-fns';
import type { OpportunitiesRecord } from '../types/airtableTypes';
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
    opportunity: Partial<OpportunitiesRecord>; // Accept any to support both custom and CRM opportunity formats
    prospectId?: string;
    maxActivityHeight?: number | string;
    formatCurrency?: (value: any) => string;
    statusLabels?: Record<string, string>;
    onAddActivity?: () => void;
}

export default function OpportunityDetails({
    opportunity,
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
        <div className="text-sm relative">
            <div className="sticky top-0 bg-white z-10   mb-2">
                <div className="flex items-center justify-end">
                    <button
                        type="button"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white border-none cursor-pointer hover:bg-blue-700"
                        onClick={onAddActivity}
                    >
                        <Iconify icon="mdi:plus" width={20} height={20} />
                    </button>
                </div>
            </div>

            <div className="mb-8">
                <div className="mb-8">
                    {/* Support both custom and CRM formats */}
                    {renderDetailItem('NAME', opportunity['First Name'] || '')}
                    {renderDetailItem('COMPANY', opportunity.Company || '')}
                    {renderDetailItem('JOB TITLE', opportunity['Job Title'] || "")}
                    {renderDetailItem('EMAIL', opportunity.Email || "")}
                    {renderDetailItem('PHONE', opportunity.Phone || "")}
                    {renderDetailItem('CURRENT STAGE', getStatusChip(opportunity['Current Stage (linked)'] || ''))}
                    {renderDetailItem('SOURCE CHANNEL', opportunity['Source Channel'] || "")}
                    {renderDetailItem('GENERAL NOTES', opportunity['General Notes'] || "")}
                    {renderDetailItem('OPPORTUNITY OWNER', opportunity["Meta Leads"] || "")}
                </div>

                <hr className="my-6 border-t border-gray-300" />

                {actualProspectId && (
                    // Use the existing ActivityList component
                    <ActivityList statusLabels={statusLabels} prospectId={actualProspectId} maxHeight={maxActivityHeight} />
                )}
            </div>
        </div>
    );
} 