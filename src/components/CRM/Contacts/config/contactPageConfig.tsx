import { CRMTablesIds } from 'src/hooks/tablehooks';
import { SelectCRMAuth } from 'src/libs/redux/crmSlice';
import { QueryOptions } from 'src/types/airtableTypes';
import { EntityPageConfig } from 'src/types/entityConfig';
import { AccountsRecord, ContactsRecord } from 'src/types/mapAirtableTypes';
import type { ColumnDef } from '../../Views/DynamicTable';
import { contactFields } from './contactFormFields';
import { ContactRenderers } from '../renderers';

// Default query options for Contacts table
export const getDefaultContactsQueryOptions = (CRMAuth: SelectCRMAuth): QueryOptions => {
    const { isAdmin, currentEmployee, userRole } = CRMAuth;
    const baseOptions: QueryOptions = {
        tableId: CRMTablesIds.Contacts,
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

// Get default columns for the contacts table
const getDefaultColumns = (): ColumnDef<Partial<ContactsRecord>>[] => [
    {
        field: 'First Name',
        headerName: 'First Name',
        width: 150,
        sortable: true,
        renderCell: ContactRenderers['First Name']
    },
    {
        field: 'Last Name',
        headerName: 'Last Name',
        width: 150,
        sortable: true,
        renderCell: ContactRenderers['Last Name']
    },
    {
        field: 'Email',
        headerName: 'Email',
        width: 200,
        sortable: true,
        renderCell: ContactRenderers.Email
    },
    {
        field: 'Phone',
        headerName: 'Phone',
        width: 150,
        sortable: true,
        renderCell: ContactRenderers.Phone
    },
    {
        field: 'Job Title',
        headerName: 'Job Title',
        width: 180,
        sortable: true,
        renderCell: ContactRenderers['Job Title']
    },
    {
        field: 'Lead Source',
        headerName: 'Lead Source',
        width: 150,
        sortable: true,
        renderCell: ContactRenderers['Lead Source']
    },
    {
        field: 'Tag',
        headerName: 'Tag',
        width: 120,
        sortable: true,
        renderCell: ContactRenderers.Tag
    },
    {
        field: 'Created',
        headerName: 'Created',
        width: 120,
        sortable: true,
        renderCell: ContactRenderers.Created
    },
    {
        field: 'Last Modified',
        headerName: 'Last Modified',
        width: 130,
        sortable: true,
        renderCell: ContactRenderers['Last Modified']
    }
];

// Main configuration function
export const getContactPageConfig = (
    accounts: Partial<AccountsRecord>[],
    CRMAuth: SelectCRMAuth
): EntityPageConfig<Partial<ContactsRecord>> => {
    const defaultQueryOptions = CRMAuth ? getDefaultContactsQueryOptions(CRMAuth) : {
        tableId: CRMTablesIds.Contacts,
        sort: [{ field: 'Created', direction: 'desc' as const }],
        filters: []
    };

    return {
        entityName: 'contacts',
        CRMAuth,
        defaultFilters: defaultQueryOptions,
        tableConfig: {
            tableColumns: getDefaultColumns(),
        },
        detailConfig: {
            formFields: contactFields,
        },
        filterFields: {

            'Name': {
                field: 'Name',
                label: 'Contact Name',
                type: 'text',
            },
            'Email': {
                field: 'Email',
                label: 'Email',
                type: 'text',
            },
            'Job Title': {
                field: 'Job Title',
                label: 'Job Title',
                type: 'text',
            }
        },
        labels: {},
        masterData: {
            accounts
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