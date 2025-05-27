import { CRMTablesIds } from 'src/hooks/tablehooks';
import { SelectCRMAuth } from 'src/libs/redux/crmSlice';
import { QueryOptions } from 'src/types/airtableTypes';
import { EntityPageConfig } from 'src/types/entityConfig';
import { AccountsRecord, ContactsRecord, OpportunitiesRecord, PipelineStageActivitiesRecord, PipelineStagesRecord, TeamMembersRecord } from 'src/types/mapAirtableTypes';
import type { ColumnDef } from '../../Views/DynamicTable';
import { AccountRenderers } from '../renderers';
import { accountFields } from './accountFormFields';
import { getEmployeeLabels, getStageActivitiesLabels, getStageActivityIds, getStageLabels } from '../../Opportunities/config/opportunityPageConfig';

interface MasterData {
    owners: Partial<TeamMembersRecord>[];
    contacts?: Partial<ContactsRecord>[];
}

// Default query options for Accounts table
export const getDefaultAccountsQueryOptions = (CRMAuth: SelectCRMAuth): QueryOptions => {
    const { isAdmin, currentEmployee, userRole } = CRMAuth;
    const baseOptions: QueryOptions = {
        tableId: CRMTablesIds.Accounts,
        sort: [{ field: "Name", direction: "asc" }],
        limit: 10000,
        filters: [],
    };

    if (!isAdmin && userRole === 'salesperson') {
        return {
            ...baseOptions,
            filters: [{
                field: 'Owner',
                operator: 'contains',
                value: currentEmployee,
                isArray: true
            }]
        };
    }

    return baseOptions;
};

// Default columns for Accounts table
const getDefaultColumns = (): ColumnDef<Partial<AccountsRecord>>[] => [
    {
        field: 'Name',
        headerName: 'Account Name',
        width: 250,
        sortable: true,
        renderCell: AccountRenderers.Name
    },
    {
        field: 'Account Lead Source ',
        headerName: 'Account Lead Source',
        width: 200,
        sortable: true,
        renderCell: AccountRenderers.AccountLeadSource
    },
    {
        field: 'Industry',
        headerName: 'Industry',
        width: 200,
        sortable: true,
        renderCell: AccountRenderers.Industry
    },
    {
        field: 'Website',
        headerName: 'Website',
        width: 200,
        sortable: true,
        renderCell: AccountRenderers.Website
    },
    {
        field: 'Priority',
        headerName: 'Priority',
        width: 150,
        sortable: true,
        renderCell: AccountRenderers.Priority
    },
    {
        field: 'Created',
        headerName: 'Created',
        width: 150,
        sortable: true,
        renderCell: AccountRenderers.Created
    },
    {
        field: 'Last Modified',
        headerName: 'Last Modified',
        width: 150,
        sortable: true,
        renderCell: AccountRenderers.LastModified
    },
];

// Main configuration function
export const getAccountPageConfig = (
    opportunities: Partial<OpportunitiesRecord>[],
    owners: Partial<TeamMembersRecord>[],
    stages: Partial<PipelineStagesRecord>[],
    stageActivityLogs: Partial<PipelineStageActivitiesRecord>[],
    contacts: Partial<ContactsRecord>[],
    CRMAuth: SelectCRMAuth
): EntityPageConfig<Partial<AccountsRecord>> => {
    const sortedStages = stages.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));
    const stageLabels = getStageLabels(sortedStages);
    const employeeLabels = getEmployeeLabels(owners);
    const stageActivitiesLabels = getStageActivitiesLabels(stageActivityLogs);
    const stageActivityIds = getStageActivityIds(stageActivityLogs);


    const defaultQueryOptions = CRMAuth ? getDefaultAccountsQueryOptions(CRMAuth) : {
        tableId: CRMTablesIds.Accounts,
        sort: [{ field: 'Created', direction: 'desc' as const }],
        filters: []
    };

    return {
        entityName: 'accounts',
        CRMAuth,
        defaultFilters: defaultQueryOptions,
        tableConfig: {
            tableColumns: getDefaultColumns(),
        },
        detailConfig: {
            formFields: accountFields,
        },
        filterFields: {
            'Name': {
                field: 'Name',
                label: 'Account Name',
                type: 'text',
            },
            'Industry': {
                field: 'Industry',
                label: 'Industry',
                type: 'text',
            },
            'Priority': {
                field: 'Priority',
                label: 'Priority',
                type: 'select',
                options: [
                    { value: 'High', label: 'High' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Low', label: 'Low' }
                ]
            }
        },
        labels: {
            stageLabels,
            employeeLabels,
            stageActivitiesLabels,
            stageActivityIds
        },
        masterData: {
            contacts,
            opportunities
        },
        modals: [],
        permissions: CRMAuth ? {
            requiredRole: ['admin', 'salesperson'],
            canView: () => true,
            canEdit: (role) => role === 'admin' || role === 'salesperson',
            canDelete: (role) => role === 'admin'
        } : {},
    };
}; 