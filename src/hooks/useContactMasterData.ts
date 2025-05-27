import { QueryOptions } from '../types/airtableTypes';
import { CRMTablesIds, useAccounts } from './tablehooks';

export const useContactMasterData = () => {
    const defaultOptions: QueryOptions = {
        tableId: CRMTablesIds.Accounts,
        sort: [{ field: 'Name', direction: 'asc' }],
        filters: []
    };

    const {
        records: accounts = [],
        isLoading: isAccountsLoading,
        isError: isAccountsError
    } = useAccounts(defaultOptions);

    return {
        accounts,
        isLoading: isAccountsLoading,
        isError: isAccountsError
    };
}; 