import { opportunityFields } from '../../../config/opportunityFormFields';
import type { OpportunitiesRecord } from '../../../types/airtableTypes';
import { formatCurrency } from '../../../utils/formatCurrency';
import { Iconify } from '../../iconify';
import ActivityList from '../Activities/ActivityList';

interface OpportunityDetailsProps {
    opportunity: OpportunitiesRecord;
    statusLabels: Record<string, string>;
    stageExplanationLabels: Record<string, Record<string, string>>;
    onAddActivity?: () => void;
}

export default function OpportunityDetails({ opportunity, statusLabels, stageExplanationLabels, onAddActivity }: OpportunityDetailsProps) {
    const getStatusChip = (status: string) => (
        <span className="border-1 border-black/50 text-gray-700 font-normal px-2 py-1 text-xs inline-block rounded-md overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
            {statusLabels[status] || status}
        </span>
    )

    const renderFieldValue = (field: any, value: any) => {
        if (value === null || value === undefined) return '-';

        switch (field.type) {
            case 'currency':
                return formatCurrency(value);
            case 'select':
                if (field.name === 'Current Stage (linked)') {
                    return getStatusChip(value?.[0]);
                }
                return value;
            default:
                return value;
        }
    };

    return (
        <div className="space-y-6">
            <div className="sticky top-0 bg-white z-10 mb-2">
                <div className="flex items-center justify-end">
                    <button
                        type="button"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white border-none cursor-pointer hover:bg-blue-700"
                        onClick={onAddActivity}
                        aria-label="Add activity"
                    >
                        <Iconify icon="mdi:plus" width={20} height={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {opportunityFields.map((field) => (
                    <div key={field.name} className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">{field.label}</h3>
                        <p className="text-sm text-gray-900">
                            {renderFieldValue(field, opportunity[field.name as keyof OpportunitiesRecord])}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <ActivityList
                    prospectId={opportunity['Prospect ID']}
                    statusLabels={statusLabels}
                    explanationLabels={stageExplanationLabels}
                />
            </div>
        </div>
    );
} 