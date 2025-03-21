import {
  Activity_LogRecord,
  EmployeesRecord,
  Meta_LeadsRecord,
  OpportunitiesRecord,
  Pipeline_StagesRecord,
  ThoughtFlow___ContentRecord
} from '../types/airtableTypes';
import { createTableHooks, TableQueryOptions } from './useAirtableTable';

// Create hooks for Opportunities table
export const OpportunityHooks = createTableHooks<OpportunitiesRecord>('Opportunities');
export const {
  useTable: useOpportunities,
  useRecordById: useOpportunityById,
  useCreateRecord: useCreateOpportunity,
  useUpdateRecord: useUpdateOpportunity,
  useDeleteRecord: useDeleteOpportunity
} = OpportunityHooks;

// Create hooks for Meta Leads table
export const MetaLeadsHooks = createTableHooks<Meta_LeadsRecord>('Meta_Leads');
export const {
  useTable: useMetaLeads,
  useRecordById: useMetaLeadById,
  useCreateRecord: useCreateMetaLead,
  useUpdateRecord: useUpdateMetaLead,
  useDeleteRecord: useDeleteMetaLead
} = MetaLeadsHooks;

// Create hooks for ThoughtFlow Content table
export const ContentHooks = createTableHooks<ThoughtFlow___ContentRecord>('ThoughtFlow___Content');
export const {
  useTable: useContent,
  useRecordById: useContentById,
  useCreateRecord: useCreateContent,
  useUpdateRecord: useUpdateContent,
  useDeleteRecord: useDeleteContent
} = ContentHooks;

// Create hooks for Activity Log table
export const ActivityLogHooks = createTableHooks<Activity_LogRecord>('Activity%20Log');
export const {
  useTable: useActivityLogs,
  useRecordById: useActivityLogById,
  useCreateRecord: useCreateActivityLog,
  useUpdateRecord: useUpdateActivityLog,
  useDeleteRecord: useDeleteActivityLog
} = ActivityLogHooks;

// Create hooks for Employees table
export const EmployeesHooks = createTableHooks<EmployeesRecord>('Employees');
export const {
  useTable: useEmployees,
  useRecordById: useEmployeeById,
  useCreateRecord: useCreateEmployee,
  useUpdateRecord: useUpdateEmployee,
  useDeleteRecord: useDeleteEmployee
} = EmployeesHooks;

// Create hooks for Pipeline Stages table
export const PipelineStagesHooks = createTableHooks<Pipeline_StagesRecord>('Pipeline%20Stages');
export const {
  useTable: usePipelineStagesBase,
  useRecordById: usePipelineStageById,
  useCreateRecord: useCreatePipelineStage,
  useUpdateRecord: useUpdatePipelineStage,
  useDeleteRecord: useDeletePipelineStage
} = PipelineStagesHooks;

// Custom hook that returns sorted pipeline stages
export const usePipelineStages = (options: TableQueryOptions = {}) => {
  const result = usePipelineStagesBase(options);
  
  // Sort the stages by ID if data is available
  const sortedRecords = [...result.records].sort((a, b) => {
    const aId = a['Stage ID'] || '';
    const bId = b['Stage ID'] || '';
    return aId.localeCompare(bId);
  });
  
  return {
    ...result,
    records: sortedRecords
  };
};

// Generic function to create hooks for any table dynamically
export function getTableHooks<T>(tableId: string) {
  return createTableHooks<T>(tableId);
} 