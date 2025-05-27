import { memo, useCallback, useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { LoadingFallback } from 'src/components/ui/loading-fallback';
import { useAccounts, useUpdateAccount } from 'src/hooks/tablehooks';
import { useSnackbar } from 'src/hooks/use-snackbar';
import type { QueryOptions, SortCondition } from 'src/types/airtableTypes';
import { EntityPageConfig } from 'src/types/entityConfig';
import type { AccountsRecord, OpportunitiesRecord } from 'src/types/mapAirtableTypes';
import AccountDetails from '../../../components/CRM/Accounts/AccountDetails';
import { ViewDrawer } from '../../../components/CRM/Modals/ViewDrawer';
import OpportunityDetails from '../../../components/CRM/Opportunities/OpportunityDetails';
import { opportunityFields } from '../../../components/CRM/Opportunities/config/opportunityFormFields';
import DynamicTable from '../../../components/CRM/Views/DynamicTable';
import { InfiniteBottomObserver } from '../../../components/CRM/Views/InfiniteBottomObserver';

// List of priority options
const PRIORITY_OPTIONS = ["All Priorities", "High", "Medium", "Low"];

const AccountsCRMPageView = memo(({ config: accountPageConfig }: { config: EntityPageConfig<Partial<AccountsRecord>> }) => {
    // State
    const [selectedAccount, setSelectedAccount] = useState<Partial<AccountsRecord> | null>(null);
    const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [opportunityDrawerOpen, setOpportunityDrawerOpen] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState<Partial<OpportunitiesRecord> | null>(null);
    const [sortCondition, setSortCondition] = useState<SortCondition>({ field: 'Name', direction: 'asc' });
    const [selectedLeadSource, setSelectedLeadSource] = useState<string>("All Sources");
    const [selectedPriority, setSelectedPriority] = useState<string>("All Priorities");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hooks
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const [defaultOptions] = useState<QueryOptions>(accountPageConfig.defaultFilters);
    const {
        records: accounts = [],
        isLoading: isAccountsLoading,
        isError,
        error,
        hasMore,
        loadMore,
        resetRecords
    } = useAccounts(defaultOptions);

    // Get the update account API hook
    const { mutate: updateAccountApi, isLoading: isUpdatingAccount } = useUpdateAccount();

    // Memoized values
    const { opportunities = [], contacts = [] } = accountPageConfig.masterData || {};
    const formFields = accountPageConfig.detailConfig.formFields;
    const columnsConfig = accountPageConfig.tableConfig.tableColumns;
    const { stageLabels = {}, employeeLabels = {} } = accountPageConfig.labels || {};

    // Extract unique lead sources from accounts
    const leadSources = useMemo(() => {
        const sources = new Set<string>();
        accounts.forEach(account => {
            const source = account['Account Lead Source '] as string;
            if (source) sources.add(source);
        });
        return ["All Sources", ...Array.from(sources)];
    }, [accounts]);

    // Filter accounts based on selected filters
    const filteredAccounts = useMemo(() => accounts.filter(account => {
        // Filter by lead source
        if (selectedLeadSource !== "All Sources" && account['Account Lead Source '] !== selectedLeadSource) {
            return false;
        }

        // Filter by priority
        if (selectedPriority !== "All Priorities" && account.Priority !== selectedPriority) {
            return false;
        }

        return true;
    }), [accounts, selectedLeadSource, selectedPriority]);

    // Sort data with custom Priority sorting
    const sortedAccounts = useMemo(() => [...filteredAccounts].sort((a, b) => {
        const field = sortCondition.field;
        const direction = sortCondition.direction;

        // Special handling for Priority field
        if (field === 'Priority') {
            const priorityOrder = { 'Low': 1, 'Medium': 2, 'High': 3 };
            const valueA = a.Priority as string || '';
            const valueB = b.Priority as string || '';

            // For empty values
            if (!valueA && !valueB) return 0;
            if (!valueA) return 1;
            if (!valueB) return -1;

            // For priority values
            const orderA = priorityOrder[valueA as keyof typeof priorityOrder] || 0;
            const orderB = priorityOrder[valueB as keyof typeof priorityOrder] || 0;

            return direction === 'asc'
                ? orderA - orderB // Low > Medium > High for ascending
                : orderB - orderA; // High > Medium > Low for descending
        }

        // Default sorting for other fields
        const valueA = a[field as keyof typeof a] || '';
        const valueB = b[field as keyof typeof b] || '';

        // For empty values
        if (!valueA && !valueB) return 0;
        if (!valueA) return 1;
        if (!valueB) return -1;

        // String comparison
        if (typeof valueA === 'string' && typeof valueB === 'string') {
            return direction === 'asc'
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
        }

        // Number comparison
        if (typeof valueA === 'number' && typeof valueB === 'number') {
            return direction === 'asc'
                ? valueA - valueB
                : valueB - valueA;
        }

        return 0;
    }), [filteredAccounts, sortCondition]);

    // Handlers
    const handleSort = useCallback((field: string, direction: 'asc' | 'desc') => {
        setSortCondition({ field, direction });
    }, []);

    const handleRowClick = useCallback((account: Partial<AccountsRecord>) => {
        setSelectedAccount(account);
        setAccountDrawerOpen(true);
        setIsEditMode(false);
        setSelectedOpportunity(null);
    }, []);

    const handleCloseAccountDrawer = useCallback(() => {
        setAccountDrawerOpen(false);
        setIsEditMode(false);
        setTimeout(() => {
            setSelectedOpportunity(null);
            setSelectedAccount(null);
        }, 300);
    }, []);

    const handleToggleEditMode = useCallback(() => {
        setIsEditMode(prevMode => !prevMode);
    }, []);

    const handleUpdateAccount = useCallback(async (updatedAccount: Partial<AccountsRecord>) => {
        try {
            setIsSubmitting(true);
            if (!selectedAccount || !selectedAccount.id) {
                setIsSubmitting(false);
                showSnackbar('Cannot update account: Missing account ID', 'error');
                return;
            }

            const changedFields = Object.entries(updatedAccount).reduce((acc, [key, value]) => {
                if (value !== selectedAccount[key as keyof AccountsRecord]) {
                    acc[key as keyof AccountsRecord] = value;
                }
                return acc;
            }, {} as Partial<AccountsRecord>);

            if (Object.keys(changedFields).length > 0) {
                try {
                    // Call the actual API to update the account
                    const updatedRecord = await updateAccountApi(selectedAccount.id, changedFields);

                    // Update the selected account with the response data
                    setSelectedAccount(updatedRecord);

                    // Note: The selectedAccount update above immediately reflects the changes in the UI
                    // We don't need to refresh the entire accounts list since the user is viewing details
                    // The accounts list will be refreshed when the user navigates back to it naturally

                    // Show success message
                    showSnackbar('Account updated successfully', 'success', true);

                    // Turn off edit mode and close drawer immediately
                    setIsEditMode(false);
                    setAccountDrawerOpen(false);

                } catch (apiError) {
                    console.error('API Error updating account:', apiError);
                    showSnackbar('Failed to update account: API error', 'error');
                }
            } else {
                showSnackbar('No changes to update', 'info');
                setAccountDrawerOpen(false);
                setIsEditMode(false);
            }

            setIsSubmitting(false);
        } catch (err) {
            setIsSubmitting(false);
            console.error('Failed to update account:', err);
            showSnackbar('Failed to update account', 'error');
        }
    }, [accounts, showSnackbar, selectedAccount, updateAccountApi]);

    // Dropdown handlers
    const handleLeadSourceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedLeadSource(e.target.value);
    }, []);

    const handlePriorityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPriority(e.target.value);
    }, []);

    return (
        <div className="w-full h-full pb-0">
            {isAccountsLoading && <LoadingFallback />}

            {/* Filter section */}
            <div className="w-full pb-2 mb-4">
                <div className="flex items-center text-xs mb-1">
                    <span className="mr-2">Lead Source</span>
                    <div className="relative inline-block">
                        <select
                            value={selectedLeadSource}
                            onChange={handleLeadSourceChange}
                            className="appearance-none bg-transparent pr-8 pl-1 py-1 text-blue-500 font-medium focus:outline-none cursor-pointer border-none"
                        >
                            {leadSources.map(source => (
                                <option key={source} value={source}>{source}</option>
                            ))}
                        </select>
                        <Iconify
                            icon="mdi:chevron-down"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 text-blue-500"
                            width={14}
                        />
                    </div>

                    <span className="mx-2">Priority</span>

                    <div className="relative inline-block">
                        <select
                            value={selectedPriority}
                            onChange={handlePriorityChange}
                            className="appearance-none bg-transparent pr-8 pl-1 py-1 text-blue-500 font-medium focus:outline-none cursor-pointer border-none"
                        >
                            {PRIORITY_OPTIONS.map(priority => (
                                <option key={priority} value={priority}>{priority}</option>
                            ))}
                        </select>
                        <Iconify
                            icon="mdi:chevron-down"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 text-blue-500"
                            width={14}
                        />
                    </div>
                </div>
            </div>

            <div className="h-[calc(100vh-150px)] flex flex-col">
                <div className="flex-grow overflow-auto">
                    <DynamicTable<Partial<AccountsRecord>>
                        columns={columnsConfig}
                        data={sortedAccounts}
                        isLoading={isAccountsLoading}
                        isError={isError}
                        error={error}
                        onRowClick={handleRowClick}
                        getRowId={(row) => row.id || `row-${Math.random().toString(36).substr(2, 9)}`}
                        errorMessage="Error loading data"
                        noDataMessage="No accounts found."
                        selectedRowId={selectedAccount?.id}
                        onSort={handleSort}
                        sortCondition={sortCondition}
                        bottomComponent={
                            <InfiniteBottomObserver
                                hasMore={hasMore}
                                loading={isAccountsLoading}
                                columns={columnsConfig}
                                onLoadMore={loadMore}
                                totalRecords={accounts.length}
                            />
                        }
                    />
                </div>
            </div>

            {/* Account Drawer (Integrated View/Edit) */}
            <ViewDrawer
                open={accountDrawerOpen}
                onClose={handleCloseAccountDrawer}
                title=""
                record={selectedAccount}
                fields={formFields}
                width={800}
                customContent={
                    selectedAccount && (
                        <AccountDetails
                            account={selectedAccount}
                            contacts={contacts}
                            opportunities={opportunities}
                            fields={formFields}
                            onOpportunityClick={(opportunity) => {
                                setSelectedOpportunity(opportunity);
                                setOpportunityDrawerOpen(true);
                            }}
                            stageLabels={stageLabels}
                            onEditClick={handleToggleEditMode}
                            onClose={handleCloseAccountDrawer}
                            isEditMode={isEditMode}
                            onSave={handleUpdateAccount}
                            isSubmitting={isSubmitting}
                        />
                    )
                }
                customActions={null}
            />

            {/* Opportunity View Drawer */}
            <ViewDrawer
                open={opportunityDrawerOpen}
                onClose={() => setOpportunityDrawerOpen(false)}
                title=" "
                record={selectedOpportunity}
                fields={opportunityFields}
                width={800}
                customContent={
                    selectedOpportunity && (
                        <OpportunityDetails
                            opportunity={selectedOpportunity}
                            stageLabels={stageLabels}
                            employeeLabels={employeeLabels}
                            fields={opportunityFields}
                        />
                    )
                }
            />

            {SnackbarComponent}
        </div>
    );
});

export default AccountsCRMPageView; 