import { CRMTablesIds } from 'src/hooks/tablehooks';
import { OpportunityMasterData } from 'src/hooks/useOpportunityMasterData';
import { SelectCRMAuth } from 'src/libs/redux/crmSlice';
import { QueryOptions } from 'src/types/airtableTypes';
import { EntityPageConfig } from 'src/types/entityConfig';
import { AccountsRecord, ContactsRecord, OpportunitiesRecord, PipelineStageActivitiesRecord, PipelineStagesRecord, PlaybookRecord, TeamMembersRecord } from 'src/types/mapAirtableTypes';
import { CRMFeatureMetadata } from 'src/utils/crmFeatures';
import { FilterField } from '../../Modals/FilterModal';
import { FieldDef } from '../../Modals/types';
import type { ColumnDef } from '../../Views/DynamicTable';
import { OpportunityRenderers } from '../renderers';
import { opportunityFields } from './opportunityFormFields';


interface MasterData {
    stages: Partial<PipelineStagesRecord>[];
    owners: Partial<TeamMembersRecord>[];
    stageActivityLogs?: Partial<PipelineStageActivitiesRecord>[];
}

export const getDefaultOpportunitiesQueryOptions = (CRMAuth: SelectCRMAuth): QueryOptions => {
    const { isAdmin, currentEmployee, userRole } = CRMAuth;
    const baseOptions: QueryOptions = {
        tableId: CRMTablesIds.Opportunities,
        sort: [{ field: "Created", direction: "desc" }],
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

export const getFilterFields = (masterData: MasterData): Record<string, FilterField> => {
    const { stages, owners } = masterData;
    const phases = stages.reduce<string[]>((acc, { Phase }) => {
        if (Phase && !acc.includes(Phase)) {
            acc.push(Phase);
        }
        return acc;
    }, []);
    return {
        "Phase": {
            field: 'Phase (from Stage)',
            label: 'Current Phase',
            type: 'select',
            options: [
                { value: 'all', label: 'All Phases', field: 'Phase (from Stage)' },
                { value: 'unassigned', label: 'Unassigned', field: 'Phase (from Stage)' },
                ...phases
                    .map(phase => ({
                        value: phase || '',
                        label: phase || '',
                        field: 'Phase (from Stage)',
                        options: stages
                            .filter(stage => stage.Phase === phase)
                            .map(stage => ({
                                value: stage.Name || '',
                                label: stage.Name || '',
                                field: 'Stage'
                            }))
                    })) || []
            ]
        },
        "Stage": {
            field: 'Stage',
            label: 'Current Stage',
            type: 'select',
            options: stages
                ?.slice()
                .sort((a, b) => (a.Name || '').localeCompare(b.Name || ''))
                .map(stage => {
                    const stageName = stage.Name?.split('-')[0].trim()
                    return {
                        value: stageName || '',
                        label: stageName || ''
                    }
                }) || []
        },
        "Owner": {
            field: 'Owner',
            label: 'Owner',
            type: 'select',
            options: [
                { value: 'all', label: 'All Owners', field: 'Owner' },
                { value: 'unassigned', label: 'Unassigned', field: 'Owner' },
                ...owners?.map(employee => ({
                    value: employee['Full Name'] || '',
                    label: employee['Full Name'] || '',
                    field: 'Owner'
                })) || []
            ]
        },
        "Salesperson Probability": {
            field: 'Salesperson Probability',
            label: 'Close Probability',
            type: 'number'
        },
        "Amount": {
            field: 'Amount',
            label: 'Amount',
            type: 'number'
        }
    };
};

const getFormFields = (metadata: CRMFeatureMetadata, ownersLabels: Record<string, string>, stageLabels: Record<string, string>, playbookLabels: Record<string, string>, accountsLabels: Record<string, string>, contactsLabels: Record<string, string>): FieldDef<Partial<OpportunitiesRecord>>[] => {
    const formFields = opportunityFields.filter(field => {
        if (field.name === 'Account') {
            return metadata.isEnableAccount;
        }
        return true;
    }) as FieldDef<Partial<OpportunitiesRecord>>[];

    formFields.forEach(field => {
        if (field.name === 'Stage') {
            field.options = stageLabels;
        }
        if (field.name === 'Owner') {
            field.options = ownersLabels;
        }
        if (field.name === 'Playbook') {
            field.options = playbookLabels;
        }
        if (metadata.isEnableAccount && field.name === 'Account') {
            field.options = accountsLabels;
        }
        if (metadata.isEnableContacts && field.name === 'Contacts') {
            field.options = contactsLabels;
        }
    });
    return formFields;
};

const getDefaultColumns = (stageLabels: Record<string, string>, employeeLabels: Record<string, string>): ColumnDef<Partial<OpportunitiesRecord>>[] => [
    {
        field: 'Name',
        headerName: 'Name',
        width: 150,
        minWidth: 100,
        sortable: true,
        renderCell: OpportunityRenderers.Name,
    },
    {
        field: 'Stage',
        headerName: 'Current Stage',
        width: 250,
        minWidth: 150,
        sortable: true,
        renderCell: OpportunityRenderers.Stage(stageLabels),
    },
    {
        field: 'Owner',
        headerName: 'Owner',
        width: 150,
        minWidth: 150,
        sortable: true,
        renderCell: OpportunityRenderers.Owner(employeeLabels),
    },
    {
        field: 'Amount',
        headerName: 'Amount',
        width: 120,
        minWidth: 120,
        sortable: true,
        renderCell: OpportunityRenderers.Amount,
    },
    {
        field: 'Salesperson Probability',
        headerName: 'Close Probability',
        width: 120,
        minWidth: 120,
        sortable: true,
        renderCell: OpportunityRenderers.CloseProbability,
    },
    {
        field: 'Created',
        headerName: 'Created Date',
        width: 120,
        minWidth: 120,
        sortable: true,
        renderCell: OpportunityRenderers.CreatedDate,
    }
];

export const getStageLabels = (stages: Partial<PipelineStagesRecord>[]) => (
    stages.reduce((acc, stage) => {
        if (stage.id && stage.Name) {
            acc[stage.id] = stage.Name;
        }
        return acc;
    }, {} as Record<string, string>)
);

export const getEmployeeLabels = (owners: Partial<TeamMembersRecord>[] | undefined) => {
    if (!owners) return {};
    return owners.reduce((acc, employee) => {
        if (employee.id && employee['Full Name']) {
            acc[employee.id] = employee['Full Name'];
        }
        return acc;
    }, {} as Record<string, string>);
};

export const getStageActivitiesLabels = (stageActivities: Partial<PipelineStageActivitiesRecord>[] | undefined) => {
    if (!stageActivities) return {};

    const groupedStageActivities = stageActivities.reduce((acc, exp) => {
        const stageId = exp.Stage?.[0];
        if (stageId) {
            if (!acc[stageId]) {
                acc[stageId] = [];
            }
            acc[stageId].push(exp);
        }
        return acc;
    }, {} as Record<string, Partial<PipelineStageActivitiesRecord>[]>);

    return Object.entries(groupedStageActivities).reduce((acc, [stageId, activities]) => {
        acc[stageId] = activities.reduce((expAcc, exp) => {
            if (exp.id && exp.Name) {
                expAcc[exp.id] = exp.Name;
            }
            return expAcc;
        }, {} as Record<string, string>);
        return acc;
    }, {} as Record<string, Record<string, string>>);
};

export const getStageActivityIds = (stageActivityLogs: Partial<PipelineStageActivitiesRecord>[] | undefined) => {
    if (!stageActivityLogs) return {};
    return stageActivityLogs.reduce((acc, stageActivity) => {
        if (stageActivity.id && stageActivity.ID) {
            acc[stageActivity.id] = stageActivity.ID;
        }
        return acc;
    }, {} as Record<string, string>);
};

export const getPlaybookLabels = (playbooks: Partial<PlaybookRecord>[]) => playbooks.reduce((acc, playbook) => {
    if (playbook.id && playbook.Name) {
        acc[playbook.id] = playbook.Name;
    }
    return acc;
}, {} as Record<string, string>);;

export const getAccountsLabels = (accounts: Partial<AccountsRecord>[]) => accounts.reduce((acc, account) => {
    if (account.id && account.Name) {
        acc[account.id] = account.Name;
    }
    return acc;
}, {} as Record<string, string>);

export const getContactsLabels = (contacts: Partial<ContactsRecord>[]) => contacts.reduce((acc, contact) => {
    if (contact.id && contact.Name) {
        acc[contact.id] = contact.Name;
    }
    return acc;
}, {} as Record<string, string>);
export const getOpportunityPageConfig = (
    masterData: OpportunityMasterData,
    CRMAuth: SelectCRMAuth,
    metadata: CRMFeatureMetadata
): EntityPageConfig<Partial<OpportunitiesRecord>> => {
    const { owners, stages, stageActivities, contacts, accounts, playbooks } = masterData.data;
    const sortedStages = stages.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));
    const stageLabels = getStageLabels(sortedStages);
    const employeeLabels = getEmployeeLabels(owners);
    const stageActivitiesLabels = getStageActivitiesLabels(stageActivities);
    const stageActivityIds = getStageActivityIds(stageActivities);
    const playbookLabels = getPlaybookLabels(playbooks);
    const accountsLabels = metadata.isEnableAccount ? getAccountsLabels(accounts) : {};
    const contactsLabels = metadata.isEnableContacts ? getContactsLabels(contacts) : {};
    const defaultQueryOptions = CRMAuth ? getDefaultOpportunitiesQueryOptions(CRMAuth) : {
        tableId: CRMTablesIds.Opportunities,
        sort: [{ field: 'Created', direction: 'desc' as const }],
        filters: []
    };

    return {
        entityName: 'opportunities',
        CRMAuth,
        defaultFilters: defaultQueryOptions,
        tableConfig: {
            tableColumns: getDefaultColumns(stageLabels, employeeLabels),
        },
        detailConfig: {
            formFields: getFormFields(metadata, employeeLabels, stageLabels, playbookLabels, accountsLabels, contactsLabels),
        },
        filterFields: getFilterFields({ stages, owners }),
        labels: {
            stageLabels,
            employeeLabels,
            stageActivitiesLabels,
            stageActivityIds,
            playbookLabels
        },
        masterData: {
            owners,
            stages: sortedStages,
            stageActivities,
            contacts,
            accounts: metadata.isEnableAccount ? accounts : []
        },
        masterDataById: {
            owners: owners.reduce((acc, owner) => {
                if (owner.id) {
                    acc[owner.id] = owner;
                }
                return acc;
            }, {} as Record<string, Partial<TeamMembersRecord>>),
            stages: sortedStages.reduce((acc, stage) => {
                if (stage.id) {
                    acc[stage.id] = stage;
                }
                return acc;
            }, {} as Record<string, Partial<PipelineStagesRecord>>),
            stageActivities: stageActivities.reduce((acc, stageActivity) => {
                if (stageActivity.id) {
                    acc[stageActivity.id] = stageActivity;
                }
                return acc;
            }, {} as Record<string, Partial<PipelineStageActivitiesRecord>>),
            contacts: metadata.isEnableContacts ? contacts.reduce((acc, contact) => {
                if (contact.id) {
                    acc[contact.id] = contact;
                }
                return acc;
            }, {} as Record<string, Partial<ContactsRecord>>) : {},
            accounts: metadata.isEnableAccount ? accounts.reduce((acc, account) => {
                if (account.id) {
                    acc[account.id] = account;
                }
                return acc;
            }, {} as Record<string, Partial<AccountsRecord>>) : {},
        },
        metadata,
        modals: [],
        permissions: CRMAuth ? {
            requiredRole: ['admin', 'salesperson'],
            canView: () => true,
            canEdit: (role) => role === 'admin' || role === 'salesperson',
            canDelete: (role) => role === 'admin'
        } : {},
    };
};