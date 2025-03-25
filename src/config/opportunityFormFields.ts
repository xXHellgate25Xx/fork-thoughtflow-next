import { OpportunitiesRecord } from 'src/types/airtableTypes';
import type { FieldDef } from '../components/CRM/Modals/EditDrawer';

// Status labels for opportunities
export const statusLabels: Record<string, string> = {
    'New': 'New',
    'Contact Made': 'Contact Made',
    'Qualified': 'Qualified',
    'Proposal Sent': 'Proposal Sent',
    'Negotiation': 'Negotiation',
    'Closed Won': 'Closed Won',
    'Closed Lost': 'Closed Lost',
};

// Source channel options
export const sourceChannelOptions = [
    { value: 'fb', label: 'Facebook' },
    { value: 'ig', label: 'Instagram' },
    { value: 'Wix Organic', label: 'Wix Organic' },
    { value: 'Wix Google Ads', label: 'Wix Google Ads' },
];

// Common form fields configuration
export const opportunityFields: FieldDef<OpportunitiesRecord>[] = [
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
        name: 'Job Title',
        label: 'Job Title',
        type: 'text',
    },
    {
        name: 'Phone',
        label: 'Phone',
        type: 'text',
    },
    {
        name: 'Source Channel',
        label: 'Source Channel',
        type: 'select',
        options: sourceChannelOptions,
    },

    // Family Information
    {
        name: 'Spouse',
        label: 'Spouse',
        type: 'text',
    },
    {
        name: '# of Children',
        label: '# of Children',
        type: 'number',
    },

    // Additional Information
    {
        name: 'Audience (from Meta Leads)',
        label: 'Audience',
        type: 'text',
    },
    {
        name: 'Salesperson (linked)',
        label: 'Salesperson',
        type: 'text',
    },
    {
        name: 'Current Stage (linked)',
        label: 'Current Stage',
        type: 'select',
        required: true,
        // Options will be populated dynamically from the database
        options: [],
        disabled: true,
    },
    {
        name: 'Deal Value',
        label: 'Deal Value',
        type: 'currency',
        required: true,
    },

    // Address Information
    {
        name: 'Address Ln 1',
        label: 'Address',
        type: 'text',
    },
    {
        name: 'City',
        label: 'City',
        type: 'text',
    },

    // Dates and Notes
    {
        name: 'Created Date',
        label: 'Created Date',
        type: 'text',
    },
    {
        name: 'General Notes',
        label: 'General Notes',
        type: 'textarea',
    },
]; 