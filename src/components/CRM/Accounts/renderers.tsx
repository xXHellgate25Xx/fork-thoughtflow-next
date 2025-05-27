import { format as formatDate } from 'date-fns';
import type { AccountsRecord } from '../../../types/mapAirtableTypes';

type PriorityLevel = 'High' | 'Medium' | 'Low';

export const AccountRenderers = {
    Name: ({ Name }: Partial<AccountsRecord>) => Name || '-',
    Website: ({ Website }: Partial<AccountsRecord>) => {
        if (!Website) return '-';
        const url = Website.startsWith('http') ? Website : `https://${Website}`;
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 hover:underline"
            >
                {Website}
            </a>
        );
    },
    Industry: ({ Industry }: Partial<AccountsRecord>) => {
        if (!Industry) return '-';
        return Industry;
    },
    Priority: ({ Priority }: Partial<AccountsRecord>) => {
        if (!Priority) return '-';
        const priority = Priority as PriorityLevel;
        
        // Color mapping based on priority level with more vibrant colors
        const colorClasses = {
            High: 'bg-red-100 text-red-800 border border-red-200',
            Medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
            Low: 'bg-green-100 text-green-800 border border-green-200',
        };
        
        return (
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${colorClasses[priority]}`}>
                {priority}
            </span>
        );
    },
    AccountLeadSource: ({ 'Account Lead Source ': accountLeadSource }: Partial<AccountsRecord>) => {
        if (!accountLeadSource) return '-';
        return accountLeadSource;
    },
    Created: ({ Created }: Partial<AccountsRecord>) => {
        if (!Created) return '-';
        try {
            return formatDate(new Date(Created as string), 'MM/dd/yyyy');
        } catch (error) {
            return '-';
        }
    },
    LastModified: ({ 'Last Modified': lastModified }: Partial<AccountsRecord>) => {
        if (!lastModified) return '-';
        try {
            return formatDate(new Date(lastModified as string), 'MM/dd/yyyy');
        } catch (error) {
            return '-';
        }
    }
}; 