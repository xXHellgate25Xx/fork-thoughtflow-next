import { OpportunitiesRecord } from 'src/types/airtableTypes';
import type { FieldDef } from '../components/CRM/Modals/types';
 

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
        name: 'Source Channel (from Leads)',
        label: 'Source Channel',
        disabled: true,
        type: 'select',
        options: sourceChannelOptions,
    },

    // Family Information
    {
        name: 'Spouse',
        label: 'Spouse',
        type: 'number',
    },
    {
        name: '# of Children',
        label: '# of Children',
        type: 'number',
    },

    // Address Information
    {
        name: 'Address Ln 1',
        label: 'Address 1',
        type: 'text',
    },
    {
        name: 'Address Ln 2',
        label: 'Address 2',
        type: 'text',
    },
    {
        name: 'City',
        label: 'City',
        type: 'text',
    },

    // Additional Information
    {
        name: 'Audience (from Leads)',
        label: 'Audience',
        disabled: true,
        type: 'text',
    },
    {
        name: 'Salesperson',
        label: 'Salesperson',
        type: 'select',
        options: [], // Will be populated dynamically from employees data
    },
    {
        name: 'Current Stage',
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

    {
        name: 'Close Probability',
        label: 'Close Probability',
        type: 'percentage',  
    },
    // Dates and Notes
    {
        name: 'Created Date',
        label: 'Created Date',
        type: 'date',
        disabled: true,
    },
    {
        name: 'General Notes',
        label: 'General Notes',
        type: 'textarea',
    },
]; 