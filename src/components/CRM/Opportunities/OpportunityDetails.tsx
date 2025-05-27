import { format as formatDate } from 'date-fns';
import { memo, useMemo, useState } from 'react';
import { useActivityLog } from 'src/hooks/tablehooks';
import type { ActivityLogRecord, OpportunitiesRecord } from 'src/types/mapAirtableTypes';
import { formatCurrency } from 'src/utils/formatCurrency';
import ActivityDetailPanel from '../Activities/ActivityDetailPanel';
import ActivityList from '../Activities/ActivityList';
import { getActivityDisplayFields } from '../Activities/config/activityFields';
import type { FieldDef } from '../Modals/types';
import PanelWrapper from '../PanelWrapper';
import ContactCard from '../Contacts/ContactCard';
import AccountCard from '../Accounts/AccountCard';

interface OpportunityDetailsProps {
    opportunity: Partial<OpportunitiesRecord>;
    stageLabels: Record<string, string>;
    employeeLabels: Record<string, string>;
    fields: FieldDef<Partial<OpportunitiesRecord>>[];
    onAddActivity?: () => void;
}

const OpportunityDetails = memo(({
    opportunity,
    stageLabels,
    employeeLabels,
    fields,
    onAddActivity
}: OpportunityDetailsProps) => {
    // State for selected contact and activity
    const [selectedActivity, setSelectedActivity] = useState<ActivityLogRecord | null>(null);

    // Get activity field definitions
    const activityDisplayFields = getActivityDisplayFields(stageLabels, employeeLabels);

    // Fetch activities for the current opportunity
    const queryParams = useMemo(() => ({
        filters: [{
            field: 'Opportunity',
            operator: 'eq' as const,
            value: opportunity.Name
        }],
        sort: [{
            field: 'Created',
            direction: 'desc' as const
        }]
    }), [opportunity.Name]);
    const { records: activities, isLoading: isActivitiesLoading, isError: isActivitiesError } = useActivityLog(queryParams);

    const getChip = (field: FieldDef<Partial<OpportunitiesRecord>>, value: string, variant: 'default' | 'secondary' = 'default') => {
        const base = 'border-1 border-black/50 text-gray-700 font-normal px-2 py-1 text-xs inline-block rounded-md overflow-hidden text-ellipsis whitespace-nowrap max-w-[250px]';
        const secondary = 'inline-block bg-gray-800 text-white px-3 py-1 rounded-md text-xs font-medium';
        return (
            <span className={variant === 'secondary' ? secondary : base}>
                {field.options?.[value] || value}
            </span>
        );
    }

    const renderFieldValue = (field: FieldDef<Partial<OpportunitiesRecord>>, value: any) => {
        if (value === null || value === undefined) return '-';

        switch (field.type) {
            case 'currency':
                return formatCurrency(value);
            case 'percentage':
                if (field.name === 'Salesperson Probability') {
                    return `${value * 100}%`;
                }
                return value;
            case 'date':
                if (field.name === 'Created') {
                    return formatDate(value, 'MM/dd/yyyy');
                }
                return value;
            case 'search':
                return getChip(field, value?.[0], 'secondary');
            case 'select':
                if (field.name === 'Stage') {
                    return getChip(field, value?.[0]);
                }
                if (field.name === 'Owner') {
                    return getChip(field, value?.[0]);
                }
                if (field.name === 'Playbook') {
                    return getChip(field, value?.[0]);
                }
                return value;
            default:
                return value;
        }
    };


    return (
        <div className="flex w-full min-w-[35vw] h-full">

            {/* Center Panel: Opportunity Details */}
            <PanelWrapper className="flex-1 w-full min-w-[35vw]">
                <div className="relative px-2">
                    <h2 className="text-lg font-semibold ml-4 mb-4">Opportunity Detail</h2>
                    <div>
                        <div className="grid grid-cols-1 gap-6 px-5 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                            {fields.map((field) => (
                                <div key={field.name} className="space-y-1 min-w-[200px] max-w-[400px]">
                                    <h3 className="text-sm font-medium text-gray-500">{field.label}</h3>
                                    <p className="text-sm text-gray-900 my-0.5">
                                        {renderFieldValue(field, opportunity[field.name as keyof OpportunitiesRecord])}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 mx-1">

                            {opportunity.Account &&
                                <>
                                    <div className="text-sm font-medium text-gray-500 mb-2 ml-4">Account</div>
                                    <AccountCard accountId={opportunity.Account as string} />
                                </> 
                                }
                            <>
                                <div className="mt-4 text-sm font-medium text-gray-500 mb-2 ml-4">Contact</div>
                                {(opportunity.Contacts as string[])?.map((id) => (
                                    <ContactCard key={id} contactId={id} />
                                ))}
                            </>
                        </div>
                        <div className="border-t my-4 border-gray-200" />
                        <div className="mt-4 mx-1">
                            <ActivityList
                                onActivityClick={setSelectedActivity}
                                stageLabels={stageLabels}
                                employeeLabels={employeeLabels}
                                activities={activities}
                                isLoading={isActivitiesLoading}
                                isError={isActivitiesError}
                                onAddActivity={onAddActivity}
                                selectedActivity={selectedActivity}
                            />
                        </div>
                    </div>
                </div>
            </PanelWrapper>

            {/* Right Panel: Activity Detail (now memoized) */}
            <PanelWrapper className={` ${selectedActivity ? 'max-w-[35vw] ' : ''}`}>
                <ActivityDetailPanel
                    key={selectedActivity?.id}
                    selectedActivity={selectedActivity}
                    activityDisplayFields={activityDisplayFields}
                    className=' px-4 '
                />
            </PanelWrapper>
        </div>
    );
});

export default OpportunityDetails;