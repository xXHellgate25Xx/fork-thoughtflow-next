import { FilterCondition } from 'src/types/airtableTypes';
import { FilterValue } from './FilterModal';

export const convertToFilterValues = (filters: FilterCondition[] | undefined): FilterValue[] => {
    if (!filters) return [];
    return filters.map(filter => {
        // Only include operators that are supported by FilterValue
        if (!['eq', 'contains', 'gt', 'lt', 'gte', 'lte'].includes(filter.operator)) {
            return null;
        }
        return {
            field: filter.field,
            value: filter.value,
            operator: filter.operator as FilterValue['operator']
        } as FilterValue;
    }).filter((filter): filter is FilterValue => filter !== null);
};

export const convertToAirtableFilters = (filters: FilterValue[]): FilterCondition[] => filters.map(filter => {
        // Special handling for Owner field which is an array in Airtable
        if (filter.field === 'Owner') {
            return {
                field: filter.field,
                operator: 'contains' as const,
                value: filter.value,
                isArray: true
            };
        }

        switch (filter.operator) {
            case 'eq':
                return {
                    field: filter.field,
                    operator: 'eq' as const,
                    value: filter.value
                };
            case 'contains':
                return {
                    field: filter.field,
                    operator: 'contains' as const,
                    value: filter.value
                };
            case 'gt':
                return {
                    field: filter.field,
                    operator: 'gt' as const,
                    value: filter.field === 'Close Probability' ? Number(filter.value) / 100 : Number(filter.value)
                };
            case 'lt':
                return {
                    field: filter.field,
                    operator: 'lt' as const,
                    value: filter.field === 'Close Probability' ? Number(filter.value) / 100 : Number(filter.value)
                };
            case 'gte':
                return {
                    field: filter.field,
                    operator: 'gte' as const,
                    value: filter.field === 'Close Probability' ? Number(filter.value) / 100 : Number(filter.value)
                };
            case 'lte':
                return {
                    field: filter.field,
                    operator: 'lte' as const,
                    value: filter.field === 'Close Probability' ? Number(filter.value) / 100 : Number(filter.value)
                };
            default:
                return null;
        }
    }).filter((filter): filter is NonNullable<typeof filter> => filter !== null); 