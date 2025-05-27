// ========================= Imports =========================
import { Button as MuiButton } from '@mui/material';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ComboboxOption } from 'src/components/ui/combobox';
import { LoadingFallback } from 'src/components/ui/loading-fallback';
import { useCreateActivityLog, useCreateSurveyResponse, useOpportunities, useUpdateOpportunity } from 'src/hooks/tablehooks';
import { useSnackbar } from 'src/hooks/use-snackbar';
import type { QueryOptions, SortCondition } from 'src/types/airtableTypes';
import { EntityPageConfig } from 'src/types/entityConfig';
import type { ActivityLogRecord, ContactsRecord, OpportunitiesRecord } from 'src/types/mapAirtableTypes';
import ActivityLogModal from '../../../components/CRM/Modals/ActivityLogModal';
import { EditDrawer } from '../../../components/CRM/Modals/EditDrawer';
import FilterModal, { FilterValue } from '../../../components/CRM/Modals/FilterModal';
import { convertToAirtableFilters, convertToFilterValues } from '../../../components/CRM/Modals/filterUtils';
import { ViewDrawer } from '../../../components/CRM/Modals/ViewDrawer';
import { OpportunitiesToolbar } from '../../../components/CRM/Opportunities/OpportunitiesToolbar';
import OpportunityDetails from '../../../components/CRM/Opportunities/OpportunityDetails';
import DynamicTable from '../../../components/CRM/Views/DynamicTable';
import { InfiniteBottomObserver } from '../../../components/CRM/Views/InfiniteBottomObserver';

// ========================= Types =========================
type ViewType = 'list';

// Utility function to map account contacts to ComboboxOptions
const getAccountContactsOptions = (accountId: string, accountsById: any, contactsById: any): ComboboxOption[] => {
    const account = accountsById?.[accountId];
    const mappedContacts = account?.Contacts?.map((contactAsString: string) => contactsById?.[contactAsString]) as Partial<ContactsRecord>[] || [];
    return mappedContacts.map(contact => ({ value: contact.id, label: contact.Name as string, field: 'Contacts' })) as ComboboxOption[];
}

const OpportunitiesCRMPageView = memo(({ config: opportunityPageConfig }: { config: EntityPageConfig<Partial<OpportunitiesRecord>> }) => {
    // ========================= State =========================
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [activityModalOpen, setActivityModalOpen] = useState(false);
    const [defaultOptions, setDefaultOptions] = useState<QueryOptions>(opportunityPageConfig.defaultFilters);
    const [viewType] = useState<ViewType>('list');
    const [selectedOpportunity, setSelectedOpportunity] = useState<Partial<OpportunitiesRecord> | null>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [searchOptions, setSearchOptions] = useState<{ [key: string]: ComboboxOption[] }>({
        'Account': [],
        'Contacts': [],
    });

    // ========================= Data Fetching =========================
    const { field: sortField, direction: sortDirection } = defaultOptions.sort?.[0] || {};
    const { mutate: createActivityLogMutation, isLoading: isCreatingActivityLog } = useCreateActivityLog();
    const {
        records: filteredOpportunities,
        isLoading: isOpportunitiesLoading,
        isError,
        error,
        refetch,
        hasMore,
        loadMore,
        resetRecords,
    } = useOpportunities(defaultOptions);
    const { mutate: updateOpportunityMutation, isLoading: isOpportunityUpdateLoading } = useUpdateOpportunity();
    const { mutate: createSurveyResponseMutation } = useCreateSurveyResponse();

    // ========================= Memoized Values =========================
    const currentFilterValues = useMemo(() => convertToFilterValues(defaultOptions.filters), [defaultOptions.filters]);
    const currentPhaseFilter = useMemo(() => defaultOptions.filters?.find(f => f.field === 'Phase (from Stage)') || null, [defaultOptions.filters]);
    const currentStageFilter = useMemo(() => defaultOptions.filters?.find(f => f.field === 'Stage') || null, [defaultOptions.filters]);
    const currentOwnerFilter = useMemo(() => defaultOptions.filters?.find(f => f.field === 'Owner') || null, [defaultOptions.filters]);

    const { owners, stages, stageActivities, accounts, contacts } = opportunityPageConfig.masterData || {};
    const { stageLabels, employeeLabels, stageActivityIds, stageActivitiesLabels, accountLabels, contactLabels } = opportunityPageConfig.labels;
    const { contacts: contactsById, accounts: accountsById } = opportunityPageConfig.masterDataById || {};
    const filterFields = opportunityPageConfig.filterFields;
    const formFields = opportunityPageConfig.detailConfig.formFields;
    const columnsConfig = opportunityPageConfig.tableConfig.tableColumns;
    const isAdmin = opportunityPageConfig.CRMAuth.isAdmin;
    const metadata = opportunityPageConfig.metadata;
    useEffect(() => {
        setSearchOptions({
            'Account': metadata?.isEnableAccount ? accounts ? accounts.map(account => ({ value: account.id, label: account.Name as string, field: 'Account' })) as ComboboxOption[] : [] : [],
            'Contacts': contacts ? contacts.map(contact => ({ value: contact.id, label: contact.Name as string, field: 'Contacts' })) as ComboboxOption[] : [],
        });
    }, [accounts, contacts]);

    // ========================= Handlers =========================
    // Toolbar filter change handler
    const handleToolbarFilterChange = useCallback((field: string, value: string) => {
        if (!defaultOptions.filters) return;
        let newFilters = [...defaultOptions.filters.filter(f => f.field !== field)];
        if (value) {
            if (field === 'Owner') {
                if (value === 'unassigned') {
                    newFilters.push({ field, operator: 'eq', value: '' });
                } else if (value !== 'all') {
                    newFilters.push({ field, operator: 'contains', value, isArray: true });
                }
            } else if (field === 'Stage' || field === "Phase (from Stage)") {
                newFilters = [...newFilters.filter(f => f.field !== "Phase (from Stage)" && f.field !== "Stage")];

                if (value === 'unassigned') {
                    newFilters.push({ field, operator: 'eq', value: '' });
                } else if (value !== 'all') {
                    newFilters.push({ field, operator: 'contains', value, isArray: true });
                }
            } else {
                newFilters.push({
                    field,
                    operator: 'eq',
                    value: field === 'Stage' ? stages?.find(s => s.id === value)?.Name || value : value
                });
            }
        }
        setDefaultOptions((prev) => ({ ...prev, filters: newFilters }));
        resetRecords();
    }, [defaultOptions.filters, stages, owners, resetRecords]);

    // Filter modal apply handler
    const handleFilterModalApply = useCallback((filters: FilterValue[]) => {
        const airtableFilters = convertToAirtableFilters(filters);
        setDefaultOptions((prev) => ({ ...prev, filters: airtableFilters }));
        resetRecords();
    }, [defaultOptions, resetRecords]);

    // Filter button click handler
    const handleFilterClick = useCallback(() => {
        setFilterModalOpen(true);
    }, []);

    // Table header sort handler
    const handleHeaderClick = useCallback((field: string) => {
        const newDirection = sortField === field ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
        defaultOptions.sort = [{ field, direction: newDirection }];
        resetRecords();
    }, [sortField, sortDirection, resetRecords]);

    // DynamicTable sort handler
    const handleSort = useCallback((field: string, direction: 'asc' | 'desc') => {
        setDefaultOptions((prev) => ({ ...prev, sort: [{ field, direction }] }));
        resetRecords();
    }, [resetRecords]);

    // Add opportunity handler (placeholder)
    const handleAddOpportunity = () => {
        console.log('Add opportunity');
    };

    // Row click handler
    const handleRowClick = useCallback((opportunity: Partial<OpportunitiesRecord>) => {
        setSelectedOpportunity(opportunity);
        setViewDrawerOpen(true);
    }, []);

    // View drawer close handler
    const handleCloseViewOpportunityDrawer = useCallback(() => {
        setViewDrawerOpen(false);
        setTimeout(() => {
            if (!drawerOpen) setSelectedOpportunity(null);
        }, 300); // Wait for drawer animation
    }, [drawerOpen]);


    // Edit click handler
    const handleEditOpportunityClick = useCallback(() => {
        if (selectedOpportunity?.Account && metadata?.isEnableAccount) {
            setSearchOptions(prev => ({
                ...prev,
                'Contacts': getAccountContactsOptions(selectedOpportunity.Account, accountsById, contactsById)
            }));
        }
        setViewDrawerOpen(false);
        setDrawerOpen(true);
    }, [selectedOpportunity, accountsById, contactsById]);

    // Edit drawer close handler
    const handleCloseOpportunityDrawer = useCallback(() => {
        setDrawerOpen(false);
        setTimeout(() => {
            if (!viewDrawerOpen) setSelectedOpportunity(null);
        }, 300);
    }, [viewDrawerOpen]);

    // Update opportunity handler
    const handleUpdateOpportunity = useCallback(async (record: Partial<OpportunitiesRecord>, oldRecord: Partial<OpportunitiesRecord>) => {
        try {
            const changedFields = Object.entries(record).reduce((acc, [key, value]) => {
                if (value !== oldRecord[key as keyof OpportunitiesRecord]) {
                    acc[key as keyof OpportunitiesRecord] = value;
                }
                return acc;
            }, {} as Partial<OpportunitiesRecord>);
            if (Object.keys(changedFields).length > 0) {
                if (changedFields.Owner) changedFields.Owner = [changedFields.Owner];
                if (changedFields.Stage) changedFields.Stage = [changedFields.Stage];
                if (changedFields.Account) changedFields.Account = [changedFields.Account];
                if (changedFields.Contacts) changedFields.Contacts = [changedFields.Contacts];
                await updateOpportunityMutation(record.id!, changedFields);
                showSnackbar('Opportunity updated successfully', 'success', true);
                // refetch();
            } else {
                showSnackbar('No changes to update', 'info');
            }
        } catch (err) {
            console.error('Failed to update opportunity:', err);
            showSnackbar('Failed to update opportunity', 'error');
            throw err;
        }
    }, [updateOpportunityMutation, refetch, showSnackbar]);

    const handleEditOpportunityFieldChange = useCallback((field: keyof OpportunitiesRecord, value: any, record: Partial<OpportunitiesRecord>) => {
        switch (field) {
            case 'Account': {
                if (metadata?.isEnableAccount) {
                    setSearchOptions(prev => ({
                        ...prev,
                        'Contacts': getAccountContactsOptions(value, accountsById, contactsById)
                    }));
                }
                break;
            }
            default:
                // no-op
                break;
        }
    }, []);

    // Activity modal close handler
    const handleCloseActivityModal = () => {
        setActivityModalOpen(false);
    };

    // Activity submit handler
    const handleActivitySubmit = async (formValues: Partial<ActivityLogRecord & { surveyId?: string; surveyResponses?: string; }>) => {
        try {
            const formatDate = (dateStr: string) => {
                if (!dateStr) return '';
                const [year, month, day] = dateStr.split('-');
                return `${year}/${month}/${day}`;
            };
            let surveyResponseId: string | undefined;
            if (formValues.surveyId && formValues.surveyResponses) {
                const surveyResponse = { 'Survey': [formValues.surveyId], 'Response': formValues.surveyResponses };
                const response = await createSurveyResponseMutation(surveyResponse);
                surveyResponseId = response?.id;
            }
            const activityLogData: Partial<ActivityLogRecord> = {
                'Opportunity': [formValues.Opportunity],
                'Current Stage': [formValues['Current Stage']],
                'New Stage': [formValues['New Stage']],
                'Assigned To': formValues['Assigned To'] ? [formValues['Assigned To']] : [],
                'Close Probability by Salesperson': formValues['Close Probability by Salesperson'] || 0,
                'Stage Activity': [formValues['Stage Activity']],
            };
            if (formValues['Next Contact Date']) activityLogData['Next Contact Date'] = formatDate(formValues['Next Contact Date']);
            if (formValues.Notes) activityLogData.Notes = formValues.Notes;
            if (surveyResponseId) activityLogData['Survey Response'] = [surveyResponseId];
            await Promise.all([
                createActivityLogMutation(activityLogData),
                updateOpportunityMutation(formValues.Opportunity, {
                    "Stage": [formValues['New Stage']],
                    "Owner": formValues['Assigned To'] ? [formValues['Assigned To']] : [],
                    "Salesperson Probability": formValues['Close Probability by Salesperson'] || 0
                })
            ]);
            showSnackbar('Activity created, Opportunity updated successfully', 'success', true);
        } catch (err) {
            console.error('Failed to create activity log:', err);
            showSnackbar('Failed to create activity log', 'error');
        } finally {
            handleCloseActivityModal();
        }
    };

    const onLoadMore = useCallback(() => {
        loadMore();
    }, [loadMore]);
    // ========================= Loading States =========================
    const loadingStates = useMemo(() => {
        const isMainDataLoading = !stages;
        const isFullScreenLoading = isMainDataLoading && isOpportunitiesLoading;
        return {
            isOpportunitiesLoading,
            isOpportunityUpdateLoading,
            isCreatingActivityLog,
            isMainDataLoading,
            isFullScreenLoading
        };
    }, [stages, stageActivities, isOpportunitiesLoading, isOpportunityUpdateLoading, isCreatingActivityLog]);

    // ========================= Render =========================
    return (
        <div className="w-full h-full text-xs pb-0">
            <OpportunitiesToolbar
                isAdmin={isAdmin}
                filters={{
                    phase: filterFields.Phase,
                    owner: filterFields.Owner
                }}
                currentFilter={{
                    phase: currentPhaseFilter,
                    stage: currentStageFilter,
                    owner: currentOwnerFilter
                }}
                sortField={sortField}
                sortDirection={sortDirection}
                columnsConfig={columnsConfig}
                onToolbarFilterChange={handleToolbarFilterChange}
                onHeaderClick={handleHeaderClick}
                onAddOpportunity={handleAddOpportunity}
                onFilterClick={handleFilterClick}
            />
            {loadingStates.isFullScreenLoading && <LoadingFallback />}
            {/* FilterModal (admin only) */}
            {isAdmin && (
                <FilterModal
                    open={filterModalOpen}
                    onClose={() => setFilterModalOpen(false)}
                    onApply={handleFilterModalApply}
                    fields={filterFields}
                    currentFilters={currentFilterValues}
                />
            )}
            {viewType === 'list' && (
                <div className="h-[calc(100vh-120px)] flex flex-col">
                    <div className="flex-grow overflow-auto" ref={tableContainerRef}>
                        <DynamicTable<Partial<OpportunitiesRecord>>
                            columns={columnsConfig}
                            data={filteredOpportunities}
                            isLoading={loadingStates.isOpportunitiesLoading}
                            isError={isError}
                            error={error}
                            onRowClick={handleRowClick}
                            getRowId={(row) => row.id || `row-${Math.random().toString(36).substr(2, 9)}`}
                            errorMessage="Error loading data"
                            noDataMessage="No opportunities found."
                            bottomComponent={
                                <InfiniteBottomObserver
                                    hasMore={hasMore}
                                    loading={loadingStates.isOpportunitiesLoading}
                                    columns={columnsConfig}
                                    onLoadMore={onLoadMore}
                                    totalRecords={filteredOpportunities.length}
                                />
                            }
                            onSort={handleSort}
                            sortCondition={sortField && sortDirection ? { field: sortField, direction: sortDirection } as SortCondition : undefined}
                        />
                    </div>
                </div>
            )}
            {/* View Drawer: Opportunity Details */}
            <ViewDrawer
                open={viewDrawerOpen}
                onClose={handleCloseViewOpportunityDrawer}
                title=""
                width={800}
                record={selectedOpportunity}
                fields={formFields}
                customContent={
                    selectedOpportunity && (
                        <OpportunityDetails
                            key={selectedOpportunity.id}
                            stageLabels={stageLabels}
                            employeeLabels={employeeLabels}
                            opportunity={selectedOpportunity as OpportunitiesRecord}
                            fields={formFields}
                            onAddActivity={() => setActivityModalOpen(true)}
                        />
                    )
                }
                customActions={
                    <>
                        <MuiButton
                            variant="contained"
                            color="primary"
                            onClick={handleEditOpportunityClick}
                            sx={{ mr: 2 }}
                        >
                            Edit
                        </MuiButton>
                        <MuiButton
                            variant="outlined"
                            onClick={handleCloseViewOpportunityDrawer}
                        >
                            Close
                        </MuiButton>
                    </>
                }
            />
            {/* Edit Drawer: Edit Opportunity */}
            <EditDrawer<OpportunitiesRecord>
                open={drawerOpen}
                onClose={handleCloseOpportunityDrawer}
                title={selectedOpportunity ? `Edit ${selectedOpportunity.Name || 'Opportunity'}` : 'Edit Opportunity'}
                initialRecord={selectedOpportunity || {}}
                submitLoading={loadingStates.isOpportunityUpdateLoading}
                hideCloseIcon
                onSave={async record => {
                    if (!selectedOpportunity) {
                        return Promise.resolve();
                    }
                    return handleUpdateOpportunity(record, selectedOpportunity);
                }}
                onFieldChange={handleEditOpportunityFieldChange}
                fields={formFields}
                searchOptions={searchOptions}
            />
            {/* Activity Log Modal */}
            <ActivityLogModal
                open={activityModalOpen}
                onClose={handleCloseActivityModal}
                selectedOpportunity={selectedOpportunity}
                stageLabels={stageLabels}
                stageActivitiesLabels={stageActivitiesLabels}
                stageActivityIds={stageActivityIds}
                stageActivities={stageActivities || []}
                onSubmit={handleActivitySubmit}
                isLoading={loadingStates.isCreatingActivityLog}
                owners={owners || []}
            />
            {SnackbarComponent}
        </div>
    );
});

export default OpportunitiesCRMPageView; 