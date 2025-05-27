import { CalendarMonth } from '@mui/icons-material';
import { format as formatDate } from 'date-fns';
import type { OpportunitiesRecord } from 'src/types/mapAirtableTypes';
import { formatCurrency } from 'src/utils/formatCurrency';

interface OpportunityCardProps {
    opportunity: Partial<OpportunitiesRecord>;
    stageLabels: Record<string, string>;
}

const OpportunityCard = ({ opportunity, stageLabels }: OpportunityCardProps) => {
    if (!opportunity) return null;

    const stageLabel = stageLabels[opportunity.Stage as string] || opportunity.Stage || '-';
    const closeDate = opportunity['Close Date']
        ? formatDate(new Date(opportunity['Close Date']), 'MM/dd/yyyy')
        : null;
    const dealType = opportunity['Deal Type'];
    const salespersonProbability = opportunity['Salesperson Probability'];
    const actualRevenue = opportunity.Account;
    const proposalUrl = opportunity['Proposal URL'];
    const createdDate = opportunity.Created ? formatDate(new Date(opportunity.Created), 'MM/dd/yyyy') : null;

    return (
        <div className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <div className="text-base font-semibold text-gray-900 mb-1">
                    {opportunity.Name}
                </div>
                <div className="text-lg font-bold text-green-700">
                    {formatCurrency(opportunity.Amount)}
                </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
                <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                    {stageLabel}
                </span>
                {closeDate && (
                    <span className="flex items-center text-xs text-gray-500 ml-2">
                        <CalendarMonth className="mr-1" />
                        {closeDate}
                    </span>
                )}
                {dealType && (
                    <span className="ml-2 text-xs text-purple-700 bg-purple-100 rounded px-2 py-0.5">
                        {dealType}
                    </span>
                )}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                {salespersonProbability !== undefined && (
                    <span>Probability: <span className="font-medium">{salespersonProbability}%</span></span>
                )}
                {actualRevenue !== undefined && (
                    <span>Actual Revenue: <span className="font-medium text-green-700">{formatCurrency(actualRevenue)}</span></span>
                )}
                {proposalUrl && (
                    <a href={proposalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Proposal</a>
                )}
                {createdDate && (
                    <span>Created: {createdDate}</span>
                )}
            </div>
            {opportunity['Full-name (from Owner)'] && (
                <div className="text-xs text-gray-500 mt-1">
                    Owner: <span className="font-medium text-gray-700">{opportunity['Full-name (from Owner)']}</span>
                </div>
            )}
        </div>
    );
};

export default OpportunityCard; 