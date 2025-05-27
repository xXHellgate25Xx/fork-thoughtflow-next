import { createApi } from '@reduxjs/toolkit/query/react';

import { airtableBaseQuery } from './airtableBaseQuery';

import type { AirtableRecord, QueryOptions } from '../../../types/airtableTypes';
 
// Helper to generate cache keys
const generateCacheKey = (tableId: string, filters?: any[], sort?: any[]) => {
  const filterKey = filters ? JSON.stringify(filters) : '';
  const sortKey = sort ? JSON.stringify(sort) : '';
  return `${tableId}${filterKey}${sortKey}`;
};

export const generalService = createApi({
  reducerPath: 'generalApi',
  baseQuery: airtableBaseQuery,
  tagTypes: ['AirtableData', 'Table', 'Record'],
  endpoints: (builder) => ({
    // Generic endpoint to query any table
    queryTable: builder.query<{ records: AirtableRecord[]; offset?: string }, QueryOptions>({
      query: (options: QueryOptions) => {
        const { tableId, filters, sort, limit, offset } = options;
        
        // Construct URL and query parameters based on Airtable API format
        // Create URLSearchParams for query parameters
        const params: Record<string, string> = {};        
        // Apply filters if they exist
        if (filters && filters.length > 0) {
          const filterConditions = filters.map(({ field, operator, value, isArray }) => {
            const fieldName = field.replace(/\s+/g, ' ');
            switch (operator) {
              case 'eq':
                if (isArray) {
                  return `FIND('${value}', ARRAYJOIN({${fieldName}}, ','))`;
                }
                return `{${fieldName}}='${value}'`;
              case 'contains':
                return `FIND('${value}', ARRAYJOIN({${fieldName}}, ','))`;
              case 'gt':
                return `{${fieldName}}>${value}`;
              case 'lt':
                return `{${fieldName}}<${value}`;
              case 'gte':
                return `{${fieldName}}>=${value}`;
              case 'lte':
                return `{${fieldName}}<=${value}`;
              default:
                return '';
            }
          }).filter(Boolean);
          params.filterByFormula = `AND(${filterConditions.join(',')})`;
        }
        
        // Apply sorting if it exists
        if (sort && sort.length > 0) {
            sort.forEach((s, index) => {
                params[`sort[${index}][field]`] = s.field;
                params[`sort[${index}][direction]`] = s.direction;
            });
        }
        
        // Apply pagination
        if (limit) {
          params.maxRecords = String(limit);
        }
        
        if (offset) {
          params.offset = offset;
        }
        
        // Return the full path with baseId/tableId structure required by Airtable API
        return {
          url: `${tableId}`,
          params
        };
      },
      transformResponse: (response: any) => {
        // Transform the response to include both records and offset
        if (response) {
          return {
            records: response.records || [],
            offset: response.offset
          };
        }
        return {
          records: [],
          offset: undefined
        };
      },
      providesTags: (result: any, error: any, { tableId, filters, sort }: QueryOptions) => [
        'AirtableData',
        { type: 'Table', id: tableId },
        { type: 'Table', id: generateCacheKey(tableId, filters, sort) },
        ...(result?.records ?? []).map(({ id }: AirtableRecord) => ({ type: 'Record' as const, id }))
      ]
    }),
    
    // Get a single record by ID
    getRecordById: builder.query<AirtableRecord, { tableId: string, recordId: string }>({
      query: ({ tableId, recordId }: { tableId: string, recordId: string }) => ({
          url: `${tableId}/${recordId}`
        }),
      transformResponse: (response: any) => {
        // Transform the response to a standardized format
        if (response) {
          return response;
        }
        return null;
      },
      providesTags: (result: any, error: any, { tableId, recordId }: { tableId: string, recordId: string }) => [
        { type: 'Record', id: recordId },
        { type: 'Table', id: tableId }
      ]
    }),
    
    // Create a new record
    createRecord: builder.mutation<AirtableRecord, { tableId: string, fields: Record<string, any> }>({
      query: ({ tableId, fields }: { tableId: string, fields: Record<string, any> }) => ({
          url: `${tableId}`,
          method: 'POST',
          body: { fields }
        }),
      invalidatesTags: (result: any, error: any, { tableId }: { tableId: string }) => [
        { type: 'Table', id: tableId },
      ]
    }),
    
    // Update an existing record
    updateRecord: builder.mutation<AirtableRecord, { tableId: string, recordId: string, fields: Record<string, any> }>({
      query: ({ tableId, recordId, fields }: { tableId: string, recordId: string, fields: Record<string, any> }) => ( {
          url: `${tableId}/${recordId}`,
          method: 'PATCH',
          body: { fields }
        }),
      invalidatesTags: (result: any, error: any, { tableId, recordId }: { tableId: string, recordId: string }) => [
        { type: 'Record', id: recordId },
        { type: 'Table', id: tableId },
      ]
    }),
    
    // Delete a record
    deleteRecord: builder.mutation<void, { tableId: string, recordId: string }>({
      query: ({ tableId, recordId }: { tableId: string, recordId: string }) => ({
          url: `${tableId}/${recordId}`,
          method: 'DELETE',
        }),
      invalidatesTags: (result: any, error: any, { tableId, recordId }: { tableId: string, recordId: string }) => [
        { type: 'Record', id: recordId },
        { type: 'Table', id: tableId },
      ]
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useQueryTableQuery,
  useLazyQueryTableQuery,
  useGetRecordByIdQuery,
  useCreateRecordMutation,
  useUpdateRecordMutation,
  useDeleteRecordMutation,
} = generalService; 