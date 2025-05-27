import type { ActivityLogRecord } from 'src/types/mapAirtableTypes';
import type { FieldDef } from '../../Modals/types';

// Basic field definitions for Activity Log display
export const activityFields: FieldDef<Partial<ActivityLogRecord>>[] = [
    {
        name: 'Current Stage',
        label: 'Current Stage',
        type: 'select',
    },
    {
        name: 'New Stage',
        label: 'New Stage',
        type: 'select',
    },
    {
        name: 'Assigned To',
        label: 'Assigned To',
        type: 'select',
    },
    {
        name: 'Created',
        label: 'Created',
        type: 'date',
    },
    {
        name: 'Next Contact Date',
        label: 'Next Contact Date',
        type: 'date',
    },
    {
        name: 'Notes',
        label: 'Notes',
        type: 'text',
    },
    {
        name: 'Survey Response',
        label: 'Survey Response',
        type: 'custom', // Or a custom type if needed for special rendering
    },
    // Add other relevant fields as needed
];

// Function to get configured fields, injecting master data labels
export const getActivityDisplayFields = (
    stageLabels: Record<string, string>,
    employeeLabels: Record<string, string>
): FieldDef<Partial<ActivityLogRecord>>[] => {
    const fields = [...activityFields]; // Create a copy to avoid modifying the original

    fields.forEach(field => {
        if (field.name === 'Current Stage' || field.name === 'New Stage') {
            field.options = stageLabels;
        }
        if (field.name === 'Assigned To') {
            field.options = employeeLabels;
        }
        // Add specific configurations for other fields if necessary
    });

    return fields;
}; 