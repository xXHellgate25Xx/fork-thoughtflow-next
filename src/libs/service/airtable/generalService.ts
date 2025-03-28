import { createApi } from '@reduxjs/toolkit/query/react';

import { airtableBaseQuery } from './airtableBaseQuery';

import type { AirtableRecord, QueryOptions } from '../../../types/airtableTypes';
// Helper function to get the Airtable base ID
const getBaseId = () => import.meta.env.VITE_AIRTABLE_BASE_ID || localStorage?.getItem('airtableBaseId') || '';

export const generalService = createApi({
  reducerPath: 'generalApi',
  baseQuery: airtableBaseQuery,
  tagTypes: ['AirtableData'],
  endpoints: (builder) => ({
    // Generic endpoint to query any table
    queryTable: builder.query<{ records: AirtableRecord[]; offset?: string }, QueryOptions>({
      query: (options) => {
        const { tableId, filters, sort, limit, offset } = options;
        
        // Construct URL and query parameters based on Airtable API format
        const baseId = getBaseId();
        // Create URLSearchParams for query parameters
        const params: Record<string, string> = {};        
        // Apply filters if they exist
        if (filters && filters.length > 0) {
          // Convert filters to formula format
          const filterFormula = filters.map(filter => {
            const { field, operator, value } = filter;
            switch (operator) {
              case 'eq': return `{${field}} = '${value}'`;
              case 'neq': return `{${field}} != '${value}'`;
              case 'lt': return `{${field}} < ${value}`;
              case 'lte': return `{${field}} <= ${value}`;
              case 'gt': return `{${field}} > ${value}`;
              case 'gte': return `{${field}} >= ${value}`;
              case 'contains': return `FIND('${value}', {${field}})`;
              case 'notContains': return `NOT(FIND('${value}', {${field}}))`;
              default: return value;
            }
          }).join(', ');
          
          params.filterByFormula = `AND(${filterFormula})`;
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
          url: `${baseId}/${tableId}`,
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
      providesTags: ['AirtableData'],
    }),
    
    // Get a single record by ID
    getRecordById: builder.query<AirtableRecord, { tableId: string, recordId: string }>({
      query: ({ tableId, recordId }) => {
        const baseId = getBaseId();
        return {
          url: `${baseId}/${tableId}/${recordId}`
        };
      },
      transformResponse: (response: any) => {
        // Transform the response to a standardized format
        if (response) {
          return response;
        }
        return null;
      },
      providesTags: ['AirtableData'],
    }),
    
    // Create a new record
    createRecord: builder.mutation<AirtableRecord, { tableId: string, fields: Record<string, any> }>({
      query: ({ tableId, fields }) => {
        const baseId = getBaseId();
        return {
          url: `${baseId}/${tableId}`,
          method: 'POST',
          body: { fields }
        };
      },
      invalidatesTags: ['AirtableData'],
    }),
    
    // Update an existing record
    updateRecord: builder.mutation<AirtableRecord, { tableId: string, recordId: string, fields: Record<string, any> }>({
      query: ({ tableId, recordId, fields }) => {
        const baseId = getBaseId();
        return {
          url: `${baseId}/${tableId}/${recordId}`,
          method: 'PATCH',
          body: { fields }
        };
      },
      invalidatesTags: ['AirtableData'],
    }),
    
    // Delete a record
    deleteRecord: builder.mutation<void, { tableId: string, recordId: string }>({
      query: ({ tableId, recordId }) => {
        const baseId = getBaseId();
        return {
          url: `${baseId}/${tableId}/${recordId}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['AirtableData'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useQueryTableQuery,
  useGetRecordByIdQuery,
  useCreateRecordMutation,
  useUpdateRecordMutation,
  useDeleteRecordMutation,
} = generalService; 