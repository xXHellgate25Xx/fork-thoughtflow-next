import { format as formatDate } from 'date-fns';
import type { ContactsRecord } from '../../../types/mapAirtableTypes';

export const ContactRenderers = {
    'First Name': ({ 'First Name': firstName }: Partial<ContactsRecord>) => firstName || '-',
    'Last Name': ({ 'Last Name': lastName }: Partial<ContactsRecord>) => lastName || '-',
    Email: ({ Email }: Partial<ContactsRecord>) => {
        if (!Email) return '-';
        return (
            <a
                href={`mailto:${Email}`}
                className="text-blue-500 hover:text-blue-700 hover:underline"
            >
                {Email}
            </a>
        );
    },
    Phone: ({ Phone }: Partial<ContactsRecord>) => Phone || '-',
    'Job Title': ({ 'Job Title': jobTitle }: Partial<ContactsRecord>) => jobTitle || '-',
    'Lead Source': ({ 'Lead Source': leadSource }: Partial<ContactsRecord>) => leadSource || '-',
    Tag: ({ Tag }: Partial<ContactsRecord>) => {
        if (!Tag) return '-';
        // If Tag is an array, join with commas
        if (Array.isArray(Tag)) {
            return Tag.join(', ');
        }
        return Tag;
    },
    Created: ({ Created }: Partial<ContactsRecord>) => {
        if (!Created) return '-';
        try {
            return formatDate(new Date(Created as string), 'MM/dd/yyyy');
        } catch {
            return '-';
        }
    },
    'Last Modified': ({ 'Last Modified': lastModified }: Partial<ContactsRecord>) => {
        if (!lastModified) return '-';
        try {
            return formatDate(new Date(lastModified as string), 'MM/dd/yyyy');
        } catch {
            return '-';
        }
    }
}; 