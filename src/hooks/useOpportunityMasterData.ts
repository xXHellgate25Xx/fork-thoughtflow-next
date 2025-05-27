import type { AccountsRecord, ContactsRecord, PipelineStageActivitiesRecord, PipelineStagesRecord, PlaybookRecord, TeamMembersRecord } from 'src/types/mapAirtableTypes';
import { CRMFeatureMetadata } from 'src/utils/crmFeatures';
import { useAllAccounts, useAllContacts, usePipelineStageActivities, usePipelineStages, usePlaybook, useTeamMembers } from './tablehooks';

export interface OpportunityMasterData {
  data: {
    owners: Partial<TeamMembersRecord>[];
    stages: Partial<PipelineStagesRecord>[];
    stageActivities: Partial<PipelineStageActivitiesRecord>[];
    contacts: Partial<ContactsRecord>[];
    accounts: Partial<AccountsRecord>[];
    playbooks: Partial<PlaybookRecord>[];
  }
  loading: {
    owners: boolean;
    stages: boolean;
    stageActivities: boolean;
    contacts: boolean;
    accounts: boolean;
    playbooks: boolean;
    all: boolean;
  };
  isError: boolean;
}

export const useOpportunityMasterData = (metadata: CRMFeatureMetadata): OpportunityMasterData => {
  const teamMembersQuery = useTeamMembers({ limit: 100 });
  const pipelineStagesQuery = usePipelineStages({ limit: 100 });
  const pipelineStageActivitiesQuery = usePipelineStageActivities({ limit: 100 });
  const playbookQuery = usePlaybook({ limit: 100 });
  const accountsQuery = useAllAccounts({sort: [{field: 'Name', direction: 'asc'}]}, 1000, !metadata.isEnableAccount);
  const contactsQuery = useAllContacts({sort: [{field: 'Name', direction: 'asc'}]});

  const isLoading =   teamMembersQuery.isLoading || 
    pipelineStagesQuery.isLoading || 
    pipelineStageActivitiesQuery.isLoading ||
    contactsQuery.isLoading ||
    accountsQuery.isLoading ||
    playbookQuery.isLoading;
  
  const isError = 
    teamMembersQuery.isError || 
    pipelineStagesQuery.isError || 
    pipelineStageActivitiesQuery.isError ||
    contactsQuery.isError ||
    accountsQuery.isError ||
    playbookQuery.isError;
 

  return {
    data:{
      owners: teamMembersQuery.records,
      stages: pipelineStagesQuery.records,
      stageActivities: pipelineStageActivitiesQuery.records,
      contacts: contactsQuery.records,
      accounts: accountsQuery.records,
      playbooks: playbookQuery.records
    },
    loading:{
      owners: teamMembersQuery.isLoading,
      stages: pipelineStagesQuery.isLoading,
      stageActivities: pipelineStageActivitiesQuery.isLoading,
      contacts: contactsQuery.isLoading,
      accounts: accountsQuery.isLoading,
      playbooks: playbookQuery.isLoading,
      all: isLoading
    },
    isError
  };
}; 