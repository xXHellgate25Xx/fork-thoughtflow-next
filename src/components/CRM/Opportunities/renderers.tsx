import { getFormattedDate } from 'src/libs/utils/TimeUtil';
import type { OpportunitiesRecord } from 'src/types/mapAirtableTypes';
import { formatCurrency } from 'src/utils/formatCurrency';

export const OpportunityRenderers = {
    Name: ({ Name: name }: Partial<OpportunitiesRecord>) => (
        <span className="block overflow-hidden text-ellipsis whitespace-nowrap" title={name}>
            {name || '-'}
        </span>
    ),
    Stage: (stageLabels: Record<string, string>) => ({ 'Stage': stage }: Partial<OpportunitiesRecord>) => {
        const stageValue = Array.isArray(stage) ? stage?.[0] : stage;
        return (
            <div className="py-1">
                {stageValue ? (
                    <span className="border-1 border-black/50 text-gray-700 font-normal px-2.5 py-1 text-xs inline-block rounded-md overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                        {stageLabels[stageValue] || stageValue}
                    </span>
                ) : (
                    '-'
                )}
            </div>
        );
    },
    Owner: (ownersLabels: Record<string, string>) => ({ 'Owner': salesperson }: Partial<OpportunitiesRecord>) => {
        const employeeValue = Array.isArray(salesperson) ? salesperson?.[0] : salesperson;
        const label = employeeValue ? (ownersLabels[employeeValue] || employeeValue) : '-';
        return <span>{label}</span>
    },
    Amount: ({ Amount: amount }: Partial<OpportunitiesRecord>) => (
        <span>{formatCurrency(amount)}</span>
    ),

    CloseProbability: ({ 'Salesperson Probability': closeProbability }: Partial<OpportunitiesRecord>) => (
        <span>{closeProbability ? `${(closeProbability * 100).toFixed(1)}%` : '-'}</span>
    ),
    CreatedDate: ({ 'Created': createdDate }: Partial<OpportunitiesRecord>) => (
        <span>{createdDate ? getFormattedDate(new Date(createdDate)) : '-'}</span>
    ),
}; 