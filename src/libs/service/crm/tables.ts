import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../supabase/baseQuery';

import type { KanbanColumn, KanbanRecord } from '../../../types/kanbanTypes';

// Utility function to validate priority
const validatePriority = (priority: string): 'high' | 'medium' | 'low' => {
  if (priority === 'high' || priority === 'medium' || priority === 'low') {
    return priority;
  }
  return 'medium'; // Default priority
};

// Transform functions for consistent data handling
const transformRecord = (record: any): KanbanRecord => ({
  id: record.id,
  title: record.fields.Title || '',
  status: record.fields.Status || 'todo',
  createdAt: record.fields.Created || '',
  updatedAt: record.fields.Updated || '',
  // Standard fields
  description: record.fields.Description || '',
  priority: validatePriority(record.fields.Priority || 'medium'),
  assignee: record.fields.Assignee || '',
  dueDate: record.fields['Due Date'] || '',
  // Additional dynamic fields from the record
  ...record.fields
});

// Type for creating a new record
type CreateRecordRequest = Omit<KanbanRecord, 'id' | 'createdAt' | 'updatedAt'>;

// Type for updating a record
interface UpdateRecordRequest {
  id: string;
  record: Partial<Omit<KanbanRecord, 'id' | 'createdAt' | 'updatedAt'>>;
}

export const KanbanApi = createApi({
  reducerPath: 'kanbanApi',
  baseQuery,
  tagTypes: ['KanbanRecord'],
  endpoints: (builder) => ({
    getRecords: builder.query<KanbanRecord[], void>({
      query: () => '/airtable/records',
      transformResponse: (response: any[]) => response.map(transformRecord),
      providesTags: ['KanbanRecord'],
    }),

    createRecord: builder.mutation<KanbanRecord, CreateRecordRequest>({
      query: (record) => {
        const now = new Date().toISOString();
        const payload = {
          fields: {
            Title: record.title,
            Description: record.description,
            Status: record.status,
            Priority: record.priority,
            Assignee: record.assignee,
            'Due Date': record.dueDate,
            Created: now,
            Updated: now,
          },
        };
        return {
          url: '/airtable/records',
          method: 'POST',
          body: payload,
        };
      },
      transformResponse: transformRecord,
      invalidatesTags: ['KanbanRecord'],
    }),

    updateRecord: builder.mutation<KanbanRecord, UpdateRecordRequest>({
      query: ({ id, record }) => {
        const payload = {
          id,
          fields: {
            ...(record.title !== undefined && { Title: record.title }),
            ...(record.description !== undefined && { Description: record.description }),
            ...(record.status !== undefined && { Status: record.status }),
            ...(record.priority !== undefined && { Priority: record.priority }),
            ...(record.assignee !== undefined && { Assignee: record.assignee }),
            ...(record.dueDate !== undefined && { 'Due Date': record.dueDate }),
            Updated: new Date().toISOString(),
          },
        };
        return {
          url: `/airtable/records/${id}`,
          method: 'PUT',
          body: payload,
        };
      },
      transformResponse: transformRecord,
      invalidatesTags: ['KanbanRecord'],
    }),

    deleteRecord: builder.mutation<void, string>({
      query: (id) => ({
        url: `/airtable/records/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['KanbanRecord'],
    }),
  }),
});

// Export the auto-generated hooks for use in components
export const {
  useGetRecordsQuery,
  useCreateRecordMutation,
  useUpdateRecordMutation,
  useDeleteRecordMutation,
} = KanbanApi;

// Helper function to organize records into columns (unchanged logic)
export const organizeRecordsByStatus = (records: KanbanRecord[]): KanbanColumn[] => {
  const columns: KanbanColumn[] = [
    { id: 'todo', title: 'To Do', records: [] },
    { id: 'in-progress', title: 'In Progress', records: [] },
    { id: 'done', title: 'Done', records: [] },
  ];

  records.forEach((record) => {
    const column = columns.find((col) => col.id === record.status);
    if (column) {
      column.records.push(record);
    } else {
      // If status doesn't match any column, default to 'todo'
      columns[0].records.push({ ...record, status: 'todo' });
    }
  });

  return columns;
};
