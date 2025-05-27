import { Team_MembersRecord } from 'src/types/airtableTypes';
import { createTableHooks } from './useAirtableTable';

import type {
  AccountsRecord,
  ActivityLogRecord,
  ContactsRecord,
  OpportunitiesRecord,
  PipelineStageActivitiesRecord,
  PipelineStagesRecord,
  PlaybookRecord,
  SurveyQuestionsRecord,
  SurveyResponsesRecord,
  SurveysRecord
} from '../types/mapAirtableTypes';

export const CRMTablesIds = {
  Opportunities: '%5BCRM%5D%20Opportunities',
  ActivityLog: '%5BCRM%5D%20Activity%20Log',
  TeamMembers: '%5BCRM%5D%20Salespersons',
  PipelineStages: '%5BCRM%5D%20Pipeline%20Stages',
  PipelineStageActivities: '%5BCRM%5D%20Pipeline%20Stage%20Activities',
  Surveys: '%5BCRM%5D%20Surveys',
  SurveyQuestions: '%5BCRM%5D%20Survey%20Questions',
  SurveyResponses: '%5BCRM%5D%20Survey%20Responses',
  Contacts: '%5BCRM%5D%20Contacts',
  Accounts: '%5BCRM%5D%20Accounts',
  Playbook: '%5BCRM%5D%20Sales%20Playbook'
}
// Create hooks for Opportunities table
export const OpportunityHooks = createTableHooks<OpportunitiesRecord>(CRMTablesIds.Opportunities);
export const {
  useTable: useOpportunities,
  useManualTable: useManualOpportunities,
  useRecordById: useOpportunityById,
  useCreateRecord: useCreateOpportunity,
  useUpdateRecord: useUpdateOpportunity,
  useDeleteRecord: useDeleteOpportunity,
  useAllAirtableRecords: useAllOpportunities
} = OpportunityHooks;
  
// Create hooks for Activity Log table
export const ActivityLogHooks = createTableHooks<ActivityLogRecord>(CRMTablesIds.ActivityLog);
export const {
  useTable: useActivityLog,
  useManualTable: useManualActivityLog,
  useRecordById: useActivityLogById,
  useCreateRecord: useCreateActivityLog,
  useUpdateRecord: useUpdateActivityLog,
  useDeleteRecord: useDeleteActivityLog,
  useAllAirtableRecords: useAllActivityLog
} = ActivityLogHooks;

// Create hooks for Team Members table
export const TeamMembersHooks = createTableHooks<Team_MembersRecord>(CRMTablesIds.TeamMembers);
export const {
  useTable: useTeamMembers,
  useRecordById: useTeamMemberById,
  useCreateRecord: useCreateTeamMember,
  useUpdateRecord: useUpdateTeamMember,
  useDeleteRecord: useDeleteTeamMember,
  useAllAirtableRecords: useAllTeamMembers
} = TeamMembersHooks;

// Create hooks for Pipeline Stages table
export const PipelineStagesHooks = createTableHooks<PipelineStagesRecord>(CRMTablesIds.PipelineStages);
export const {
  useTable: usePipelineStages,
  useRecordById: usePipelineStageById,
  useCreateRecord: useCreatePipelineStage,
  useUpdateRecord: useUpdatePipelineStage,
  useDeleteRecord: useDeletePipelineStage,
  useAllAirtableRecords: useAllPipelineStages
} = PipelineStagesHooks;
  

// Create hooks for Stage ActivityLog table
export const PipelineStageActivitiesHooks = createTableHooks<PipelineStageActivitiesRecord>(CRMTablesIds.PipelineStageActivities);
export const {
  useTable: usePipelineStageActivities,
  useRecordById: usePipelineStageActivityById,
  useCreateRecord: useCreateStageActivityLog,
  useUpdateRecord: useUpdateStageActivityLog,
  useDeleteRecord: useDeleteStageActivityLog,
  useAllAirtableRecords: useAllPipelineStageActivities
} = PipelineStageActivitiesHooks;

// Create hooks for Surveys table
export const SurveysHooks = createTableHooks<SurveysRecord>(CRMTablesIds.Surveys);
export const {
  useTable: useSurveys,
  useManualTable: useManualSurveys,
  useRecordById: useSurveyById,
  useCreateRecord: useCreateSurvey,
  useUpdateRecord: useUpdateSurvey,
  useDeleteRecord: useDeleteSurvey,
  useAllAirtableRecords: useAllSurveys
} = SurveysHooks;

// Create hooks for Survey Questions table
export const SurveyQuestionsHooks = createTableHooks<SurveyQuestionsRecord>(CRMTablesIds.SurveyQuestions);
export const {
  useTable: useSurveyQuestions,
  useManualTable: useManualSurveyQuestions,
  useRecordById: useSurveyQuestionById,
  useCreateRecord: useCreateSurveyQuestion,
  useUpdateRecord: useUpdateSurveyQuestion,
  useDeleteRecord: useDeleteSurveyQuestion,
  useAllAirtableRecords: useAllSurveyQuestions
} = SurveyQuestionsHooks;

// Create hooks for Survey Responses table
export const SurveyResponsesHooks = createTableHooks<SurveyResponsesRecord>(CRMTablesIds.SurveyResponses);
export const {
  useTable: useSurveyResponses,
  useManualTable: useManualSurveyResponses,
  useRecordById: useSurveyResponseById,
  useCreateRecord: useCreateSurveyResponse,
  useUpdateRecord: useUpdateSurveyResponse,
  useDeleteRecord: useDeleteSurveyResponse,
  useAllAirtableRecords: useAllSurveyResponses
} = SurveyResponsesHooks;

// Create hooks for Contacts table
export const ContactsHooks = createTableHooks<ContactsRecord>(CRMTablesIds.Contacts);
export const {
  useTable: useContacts,
  useRecordById: useContactById,
  useCreateRecord: useCreateContact,
  useUpdateRecord: useUpdateContact,
  useDeleteRecord: useDeleteContact,
  useAllAirtableRecords: useAllContacts
} = ContactsHooks;

// Create hooks for Accounts table
export const AccountsHooks = createTableHooks<AccountsRecord>(CRMTablesIds.Accounts);
export const {
  useTable: useAccounts,
  useRecordById: useAccountById,
  useCreateRecord: useCreateAccount,
  useUpdateRecord: useUpdateAccount,
  useDeleteRecord: useDeleteAccount,
  useAllAirtableRecords: useAllAccounts
} = AccountsHooks;

// Create hooks for Playbooks table
export const PlaybookHooks = createTableHooks<PlaybookRecord>(CRMTablesIds.Playbook);
export const {
  useTable: usePlaybook,
  useRecordById: usePlaybookById,
  useCreateRecord: useCreatePlaybook,
  useUpdateRecord: useUpdatePlaybook,
  useDeleteRecord: useDeletePlaybook,
  useAllAirtableRecords: useAllPlaybook
} = PlaybookHooks;

// Generic function to create hooks for any table dynamically
export function getTableHooks<T>(tableId: string) {
  return createTableHooks<T>(tableId);
}