import { FilterField } from 'src/components/CRM/Modals/FilterModal';
import { FieldDef, FormRecord } from 'src/components/CRM/Modals/types';
import { ColumnDef } from 'src/components/CRM/Views/DynamicTable';
import { SelectCRMAuth } from 'src/libs/redux/crmSlice';
import { CRMFeatureMetadata } from 'src/utils/crmFeatures';
import type { QueryOptions } from './airtableTypes';
import { AccountsRecord, ContactsRecord, OpportunitiesRecord, PipelineStageActivitiesRecord, PipelineStagesRecord, TeamMembersRecord } from './mapAirtableTypes';

export interface ModalDef {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  triggerCondition?: (data: any) => boolean;
}

export interface PermissionConfig {
  requiredRole?: string[];
  canView?: (userRole: string) => boolean;
  canEdit?: (userRole: string) => boolean;
  canDelete?: (userRole: string) => boolean;
}

export interface CustomHooksConfig {
  useList?: () => any;
  useCreate?: () => any;
  useUpdate?: () => any;
  useDelete?: () => any;
  useCreateActivityLog?: () => any;
  useCreateSurveyResponse?: () => any;
}

export interface EntityPageConfig<T extends FormRecord = FormRecord> {
  entityName: string;
  CRMAuth: SelectCRMAuth;
  defaultFilters: QueryOptions;
  tableConfig:{
    tableColumns: ColumnDef<T>[]
  }
  masterData?: {
    owners?: Partial<TeamMembersRecord>[];
    stages? : Partial<PipelineStagesRecord>[];
    stageActivities?: Partial<PipelineStageActivitiesRecord>[];
    contacts?: Partial<ContactsRecord>[];
    accounts?: Partial<AccountsRecord>[];
    opportunities?: Partial<OpportunitiesRecord>[];
  }
  masterDataById?: {
    owners?: Record<string, Partial<TeamMembersRecord>>;
    stages?: Record<string, Partial<PipelineStagesRecord>>;
    stageActivities?: Record<string, Partial<PipelineStageActivitiesRecord>>;
    contacts?: Record<string, Partial<ContactsRecord>>;
    accounts?: Record<string, Partial<AccountsRecord>>;
  }
  filterFields: Record<string, FilterField>;
  detailConfig: {
    formFields: FieldDef<T>[];
  }
  modals: ModalDef[];
  labels: Record<string, any>;
  permissions: PermissionConfig;
  metadata?: CRMFeatureMetadata;
  customHooks?: CustomHooksConfig;
  defaultView?: 'list' | 'kanban';
  kanbanConfig?: {
    groupByField: string;
    displayFields: Array<{
      field: string;
      label: string;
      render?: (value: any) => React.ReactNode;
    }>;
  };
} 