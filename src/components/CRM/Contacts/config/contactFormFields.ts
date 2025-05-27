import { ContactsRecord } from 'src/types/mapAirtableTypes';
import type { FieldDef } from '../../Modals/types';

// Common form fields configuration for Contacts
export const contactFields: FieldDef<Partial<ContactsRecord>>[] = [
    // Basic Information
    {
        name: 'First Name',
        label: 'First Name',
        type: 'text',
        required: true,
    },
    {
        name: 'Last Name',
        label: 'Last Name',
        type: 'text',
        required: true,
    },
    {
        name: 'Email',
        label: 'Email',
        type: 'text',
        required: true,
    },
    {
        name: 'Phone',
        label: 'Phone',
        type: 'text',
    },
    {
        name: 'Job Title',
        label: 'Job Title',
        type: 'text',
    },
    // Additional Information
    {
        name: 'Website',
        label: 'Website',
        type: 'text',
    },
    {
        name: 'LinkedIn',
        label: 'LinkedIn Profile',
        type: 'text',
    },
    {
        name: 'Address',
        label: 'Address',
        type: 'text',
    },
    {
        name: 'City',
        label: 'City',
        type: 'text',
    },
    {
        name: 'State/Province',
        label: 'State/Province',
        type: 'text',
    },
    {
        name: 'Country',
        label: 'Country',
        type: 'text',
    },
    {
        name: 'Timezone',
        label: 'Timezone',
        type: 'text',
    },
    {
        name: 'Notes',
        label: 'Notes',
        type: 'textarea',
    },
    {
        name: 'Preferred Contact Method',
        label: 'Preferred Contact Method',
        type: 'select',
        options: {
            'Email': 'Email',
            'Phone': 'Phone',
            'LinkedIn': 'LinkedIn',
            'Other': 'Other'
        }
    },
    {
        name: 'Lead Source',
        label: 'Lead Source',
        type: 'text',
    },
    // Dates
    {
        name: 'Created',
        label: 'Created',
        type: 'date',
        disabled: true,
    },
    {
        name: 'Last Modified',
        label: 'Last Modified',
        type: 'date',
        disabled: true,
    }
]; 