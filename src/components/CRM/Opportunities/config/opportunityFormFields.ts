import { OpportunitiesRecord } from 'src/types/mapAirtableTypes';
import type { FieldDef } from '../../Modals/types';

// Source channel options
export const sourceChannelOptions = [
    { value: 'fb', label: 'Facebook' },
    { value: 'ig', label: 'Instagram' },
    { value: 'Wix Organic', label: 'Wix Organic' },
    { value: 'Wix Google Ads', label: 'Wix Google Ads' },
];

// Common form fields configuration
export const opportunityFields: FieldDef<Partial<OpportunitiesRecord>>[] = [
    // Basic Information
    {
        name: 'Name',
        label: 'Name',
        type: 'text',
        required: true,
    },
    {
        name: 'Owner',
        label: 'Owner',
        type: 'select',
        options: {}, // Will be populated dynamically from owners data
    },
    {
        name: 'Account',
        label: 'Account',
        type: 'search',
        required: true,
    },
    {
        name: 'Contacts',
        label: 'Contacts',
        type: 'search',
        required: true,
    }, 
    {
        name: 'Deal Type',
        label: 'Deal Type',
        type: 'select',
        required: true,
        options: {
            'Staffing': 'Staffing',
            'AI Program': 'AI Program',
            'AI-Officer Training': 'AI-Officer Training',
        },
    },
    
    {
        name: 'Playbook',
        label: 'Playbook',
        type: 'select',
        options: {}, // Will be populated dynamically from playbooks data
    },

    {
        name: 'Stage',
        label: 'Stage',
        type: 'select',
        required: true,
        // Options will be populated dynamically from the database
        options: {},
        disabled: true,
    },
    {
        name: 'Amount',
        label: 'Amount',
        type: 'currency',
        required: true,
    },

    {
        name: 'Salesperson Probability',
        label: 'Salesperson Probability',
        type: 'percentage',  
    },
    // Dates and Notes
    {
        name: 'Created',
        label: 'Created',
        type: 'date',
        disabled: true,
    }, 
]; 