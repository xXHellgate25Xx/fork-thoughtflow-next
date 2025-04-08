import { Button as MuiButton } from '@mui/material';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FieldDef } from 'src/components/CRM/Modals/types';
import { DynamicKanban } from 'src/components/ui/kanban/DynamicKanban';
import { useCreateActivityLog, useEmployees, useOpportunities, usePipelineStages, useStageExplanations, useUpdateOpportunity } from 'src/hooks/tablehooks';
import { useSnackbar } from 'src/hooks/use-snackbar';
import { TableQueryOptions } from 'src/hooks/useAirtableTable';
import type { OpportunitiesRecord, Stage_ExplanationRecord } from 'src/types/airtableTypes';
import type { KanbanColumn, KanbanRecord } from 'src/types/kanbanTypes';
import { ActivityLogRecord } from 'src/types/supabase';
import ActivityLogModal from '../components/CRM/Modals/ActivityLogModal';
import EditDrawer from '../components/CRM/Modals/EditDrawer';
import FilterModal, { FilterField, FilterValue } from '../components/CRM/Modals/FilterModal';
import ViewDrawer from '../components/CRM/Modals/ViewDrawer';
import OpportunityDetails from '../components/CRM/Opportunities/OpportunityDetails';
import type { ColumnDef } from '../components/CRM/Views/DynamicTable';
import DynamicTable from '../components/CRM/Views/DynamicTable';
import { Iconify } from '../components/iconify';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { opportunityFields, sourceChannelOptions } from '../config/opportunityFormFields';

type ViewType = 'list' | 'kanban';

// Add this component before the OpportunitiesCRMPage
const LoadMoreObserver = ({ onIntersect, loading, columns }: { onIntersect: () => void, loading: boolean, columns: ColumnDef<any>[] }) => {
    const observerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !loading) {
                    onIntersect();
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = observerRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [onIntersect, loading]);

    return (
        <tr>
            <td colSpan={columns.length}>
                <div ref={observerRef} className="h-0 w-full" />
            </td>
        </tr>
    );
};

const OpportunitiesCRMPage = memo(() => {
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const { records: stages, isError: stagesError } = usePipelineStages();
    const { records: stageExplanations } = useStageExplanations();
    const { records: employees } = useEmployees();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [activityModalOpen, setActivityModalOpen] = useState(false);
    const [options, setOptions] = useState<TableQueryOptions>({
        sort: [{ field: "Prospect ID", direction: "asc" }],
        limit: 10000,
        filters: []
    });
    const [viewType, setViewType] = useState<ViewType>('list');
    const [selectedOpportunity, setSelectedOpportunity] = useState<Partial<OpportunitiesRecord> | null>(null);
    const [groupByField, setGroupByField] = useState<string>('Stage ID');
    const kanbanColumnsRef = useRef<any[]>([]);
    const { field: sortField, direction: sortDirection } = options.sort?.[0] || {};
    const { mutate: createActivityLogMutation, isLoading: activityLoading } = useCreateActivityLog();
    const {
        records: opportunities,
        isLoading,
        isError,
        error,
        refetch,
        hasMore,
        loadMore,
        resetRecords
    } = useOpportunities(options);

    const { mutate: updateOpportunityMutation, isLoading: updateOpportunityLoading } = useUpdateOpportunity();
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    // Define filter fields based on master data
    const filterFields: FilterField[] = useMemo(() => [
        {
            field: 'Current Stage',
            label: 'Current Stage',
            type: 'select',
            options: stages?.map(stage => ({
                value: stage['Stage ID'] || '',
                label: stage['Stage ID'] || ''
            })) || []
        },
        {
            field: 'Salesperson',
            label: 'Salesperson',
            type: 'select',
            options: employees?.map(employee => ({
                value: employee.Name || '',
                label: employee.Name || ''
            })) || []
        },
        {
            field: 'Source Channel (from Leads)',
            label: 'Source Channel',
            type: 'select',
            options: sourceChannelOptions.map(option => ({
                value: option.value,
                label: option.label
            }))
        },
        {
            field: 'Close Probability',
            label: 'Close Probability',
            type: 'number'
        },
        {
            field: 'Deal Value',
            label: 'Deal Value',
            type: 'number'
        }
    ], [stages, employees]);

    // Handle toolbar filter changes
    const handleToolbarFilterChange = useCallback((field: string, value: string) => {
        if (!options.filters) return;
        const newFilters = options.filters.filter(f => f.field !== field);
        if (value) {
            if (value === 'unassigned') {
                newFilters.push({
                    field,
                    operator: 'eq',
                    value: ''
                });
            } else {
                newFilters.push({
                    field,
                    operator: 'eq',
                    value: field === 'Current Stage'
                        ? stages?.find(s => s.id === value)?.['Stage ID'] || value
                        : field === 'Salesperson'
                            ? employees?.find(e => e.id === value)?.Name || value
                            : value
                });
            }
        }
        setOptions(prev => ({
            ...prev,
            filters: newFilters
        }));
        resetRecords();
    }, [options.filters, stages, employees, resetRecords]);

    // Handle filter changes from FilterModal
    const handleFilterModalApply = useCallback((filters: FilterValue[]) => {
        // Convert FilterValue[] to Airtable filter conditions
        const airtableFilters = filters.map(filter => {
            switch (filter.operator) {
                case 'eq':
                    return {
                        field: filter.field,
                        operator: 'eq' as const,
                        value: filter.value
                    };
                case 'contains':
                    return {
                        field: filter.field,
                        operator: 'contains' as const,
                        value: filter.value
                    };
                case 'gt':
                    return {
                        field: filter.field,
                        operator: 'gt' as const,
                        value: filter.field === 'Close Probability' ? Number(filter.value) / 100 : Number(filter.value)
                    };
                case 'lt':
                    return {
                        field: filter.field,
                        operator: 'lt' as const,
                        value: filter.field === 'Close Probability' ? Number(filter.value) / 100 : Number(filter.value)
                    };
                case 'gte':
                    return {
                        field: filter.field,
                        operator: 'gte' as const,
                        value: filter.field === 'Close Probability' ? Number(filter.value) / 100 : Number(filter.value)
                    };
                case 'lte':
                    return {
                        field: filter.field,
                        operator: 'lte' as const,
                        value: filter.field === 'Close Probability' ? Number(filter.value) / 100 : Number(filter.value)
                    };
                default:
                    return null;
            }
        }).filter((filter): filter is NonNullable<typeof filter> => filter !== null);

        setOptions(prev => ({
            ...prev,
            filters: airtableFilters
        }));
        resetRecords();
    }, [stages, employees, resetRecords]);

    // Convert Airtable filters to FilterValue[] for FilterModal
    const currentFilterValues = useMemo(() => {
        if (!options.filters) return [];
        const filters = options.filters.map(filter => {
            // Only include operators that are supported by FilterValue
            if (!['eq', 'contains', 'gt', 'lt', 'gte', 'lte'].includes(filter.operator)) {
                return null;
            }
            return {
                field: filter.field,
                value: filter.value,
                operator: filter.operator as FilterValue['operator']
            } as FilterValue;
        }).filter((filter): filter is FilterValue => filter !== null);
        return filters;
    }, [options.filters]);

    // Get current stage filter value
    const currentStageFilter = useMemo(() => {
        if (!options.filters) return null;
        return options.filters.find(f => f.field === 'Current Stage');
    }, [options.filters]);

    // Get current salesperson filter value
    const currentSalespersonFilter = useMemo(() => {
        if (!options.filters) return null;
        return options.filters.find(f => f.field === 'Salesperson');
    }, [options.filters]);

    // Remove the client-side filtering logic
    const filteredOpportunities = opportunities;

    // Update the filter button click handler
    const handleFilterClick = useCallback(() => {
        setFilterModalOpen(true);
    }, []);

    // Modify view type handler
    const handleViewTypeChange = useCallback((type: ViewType) => {
        setViewType(type);
    }, []);

    // Modify group by handler
    const handleGroupByChange = useCallback((field: string) => {
        setGroupByField(field);
    }, []);

    // Handler for sorting
    const handleHeaderClick = useCallback((field: string) => {
        const newDirection = sortField === field
            ? (sortDirection === 'asc' ? 'desc' : 'asc')
            : 'asc';

        // Update sort parameters
        setOptions({ ...options, sort: [{ field, direction: newDirection }] });
    }, [sortField, sortDirection, options]);

    // Map stages to statusLabels
    const statusLabels = stages.reduce((acc, stage) => {
        if (stage.id && stage["Stage ID"]) {
            acc[stage.id] = stage["Stage ID"]; // Assuming stage has 'id' and 'label' properties
            return acc;
        }
        return acc;
    }, {} as Record<string, string>);

    // Map employees to a lookup object for easy access
    const employeeMap = useMemo(() => {
        if (!employees) return {};
        return employees.reduce((acc, employee) => {
            if (employee.id && employee.Name) {
                acc[employee.id] = employee.Name;
            }
            return acc;
        }, {} as Record<string, string>);
    }, [employees]);

    // Group stage explanations by pipeline stage
    const groupedStageExplanationLabels = useMemo(() => {
        if (!stageExplanations) return { stageExplanationLabels: {}, groupedExplanations: {} };
        const groupedExplanations = stageExplanations.reduce((acc, exp) => {
            const stageId = exp['Pipeline Stage Linked']?.[0];
            if (stageId) {
                if (!acc[stageId]) {
                    acc[stageId] = [];
                }
                acc[stageId].push(exp);
            }
            return acc;
        }, {} as Record<string, Partial<Stage_ExplanationRecord>[]>);

        // Create a map where each stageId maps to an object of explanation ID -> explanation text
        const stageExplanationLabels = Object.entries(groupedExplanations).reduce((acc, [stageId, explanations]) => {
            acc[stageId] = explanations.reduce((expAcc, exp) => {
                if (exp.id && exp.Explanation) {
                    expAcc[exp.id] = exp.Explanation;
                }
                return expAcc;
            }, {} as Record<string, string>);
            return acc;
        }, {} as Record<string, Record<string, string>>);

        return stageExplanationLabels;
    }, [stageExplanations]);

    const sourceChannelLabels = useMemo(() => sourceChannelOptions.reduce((acc, option) => {
        acc[option.value] = option.label;
        return acc;
    }, {} as Record<string, string>), []);

    const formatCurrency = (value?: number) => {
        if (!value) return '-';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const handleAddOpportunity = () => {
        // Implementation for adding a new opportunity
        console.log('Add opportunity');
    };

    const handleRowClick = useCallback((opportunity: Partial<OpportunitiesRecord>) => {
        // Set selected opportunity
        setSelectedOpportunity(opportunity);
        // Open view drawer instead of edit drawer
        setViewDrawerOpen(true);
    }, []);

    const handleCloseViewDrawer = useCallback(() => {
        setViewDrawerOpen(false);
        // Clear states after drawer is closed
        setTimeout(() => {
            if (!drawerOpen) {
                setSelectedOpportunity(null);
            }
        }, 300); // Small delay to ensure drawer animation completes
    }, [drawerOpen]);

    const handleEditClick = useCallback(() => {
        // Close view drawer and open edit drawer
        setViewDrawerOpen(false);
        setDrawerOpen(true);
    }, []);

    const handleCloseDrawer = useCallback(() => {
        setDrawerOpen(false);
        // Clear states after drawer is closed
        setTimeout(() => {
            if (!viewDrawerOpen) {
                setSelectedOpportunity(null);
            }
        }, 300);
    }, [viewDrawerOpen]);

    const handleUpdateOpportunity = useCallback(async (record: Partial<OpportunitiesRecord>, oldRecord: Partial<OpportunitiesRecord>) => {
        try {
            // Create an object with only the changed fields
            const changedFields = Object.entries(record).reduce((acc, [key, value]) => {
                if (value !== oldRecord[key as keyof OpportunitiesRecord]) {
                    acc[key as keyof OpportunitiesRecord] = value;
                }
                return acc;
            }, {} as Partial<OpportunitiesRecord>);
            // Only proceed if there are changes
            if (Object.keys(changedFields).length > 0) {

                if (changedFields.Salesperson) {
                    changedFields.Salesperson = [changedFields.Salesperson];
                }
                if (changedFields['Current Stage']) {
                    changedFields['Current Stage'] = [changedFields['Current Stage']];
                }

                // Update the opportunity using the mutation with only changed fields
                await updateOpportunityMutation(record.id!, changedFields);

                // Show success message using snackbar
                showSnackbar('Opportunity updated successfully', 'success', true);

                // Refresh the opportunities data
                refetch();
            } else {
                showSnackbar('No changes to update', 'info');
            }
        } catch (err) {
            console.error('Failed to update opportunity:', err);
            showSnackbar('Failed to update opportunity', 'error');
            throw err; // Re-throw to let EditDrawer handle the error state
        }
    }, [updateOpportunityMutation, refetch, showSnackbar]);

    // Define table columns
    const columnsConfig: ColumnDef<any>[] = [
        {
            field: 'Prospect ID',
            headerName: 'Prospect ID',
            width: 100,
            minWidth: 100,
            sortable: true,
            onHeaderClick: () => handleHeaderClick('Prospect ID'),
            sortDirection: sortField === 'Prospect ID' ? sortDirection : undefined,
            renderCell: (row) => (
                <span className="block overflow-hidden text-ellipsis whitespace-nowrap" title={row['Prospect ID']}>
                    {row['Prospect ID']}
                </span>
            ),
        },
        {
            field: 'Last Name',
            headerName: 'Last Name',
            width: 120,
            minWidth: 120,
            sortable: true,
            sortDirection: sortField === 'Last Name' ? sortDirection : undefined,
            onHeaderClick: () => handleHeaderClick('Last Name'),
        },
        {
            field: 'Email',
            headerName: 'Email',
            width: 200,
            minWidth: 200,
            sortable: true,
            sortDirection: sortField === 'Email' ? sortDirection : undefined,
            onHeaderClick: () => handleHeaderClick('Email'),
            renderCell: (row) => (
                <span className="block overflow-hidden text-ellipsis whitespace-nowrap" title={row.Email}>
                    {row.Email}
                </span>
            ),
        },
        {
            field: 'Current Stage',
            headerName: 'Current Stage',
            width: 150,
            minWidth: 150,
            sortable: true,
            sortDirection: sortField === 'Current Stage' ? sortDirection : undefined,
            onHeaderClick: () => handleHeaderClick('Current Stage'),
            renderCell: (row) => (
                <div className="py-1">
                    <span className="border-1 border-black/50 text-gray-700 font-normal px-2.5 py-1 text-xs inline-block rounded-md overflow-hidden text-ellipsis whitespace-nowrap max-w-[140px]">
                        {statusLabels[row['Current Stage']] || row['Current Stage']}
                    </span>
                </div>
            ),
        },
        {
            field: 'Salesperson',
            headerName: 'Salesperson',
            width: 150,
            minWidth: 150,
            sortable: true,
            sortDirection: sortField === 'Salesperson' ? sortDirection : undefined,
            onHeaderClick: () => handleHeaderClick('Salesperson'),
            renderCell: (row) => {
                const salespersonId = row.Salesperson?.[0];
                return salespersonId ? employeeMap[salespersonId] || '-' : '-';
            },
        },
        {
            field: 'Deal Value',
            headerName: 'Deal Value',
            width: 120,
            minWidth: 120,
            sortable: true,
            sortDirection: sortField === 'Deal Value' ? sortDirection : undefined,
            onHeaderClick: () => handleHeaderClick('Deal Value'),
            renderCell: (row) => formatCurrency(row['Deal Value']) ?? "-",
        },
        {
            field: 'Close Probability',
            headerName: 'Close Probability',
            width: 120,
            minWidth: 120,
            sortable: true,
            sortDirection: sortField === 'Close Probability' ? sortDirection : undefined,
            onHeaderClick: () => handleHeaderClick('Close Probability'),
            renderCell: (row) => row['Close Probability'] ? `${row['Close Probability'] * 100}%` : '-',
        },
        {
            field: 'General Notes',
            headerName: 'General Notes',
            width: 200,
            minWidth: 200,
            sortable: true,
            sortDirection: sortField === 'General Notes' ? sortDirection : undefined,
            onHeaderClick: () => handleHeaderClick('General Notes'),
            renderCell: (row) => (
                <span className="block overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]" title={row['General Notes']}>
                    {row['General Notes']}
                </span>
            ),
        },
    ];

    // Define form fields for the drawer
    const formFields: FieldDef<OpportunitiesRecord>[] = opportunityFields.map(field => {
        if (field.name === 'Current Stage') {
            return {
                ...field,
                options: Object.entries(statusLabels).map(([value, label]) => ({
                    value,
                    label
                })),
                disabled: true
            };
        }
        if (field.name === 'Salesperson') {

            return {
                ...field,
                options: Object.entries(employeeMap).map(([value, label]) => ({
                    value,
                    label
                }))
            };
        }
        return field;
    });

    // Memoize the item mapping function for sorted data
    const mapItemsFromSortedData = useMemo(() => (data: any[]) => data.map(item => ({
        id: item['Prospect ID'],
        title: item['Last Name'],
        status: item[groupByField as keyof typeof item],
        dealValue: item['Deal Value'],
        closeProbability: item['Close Probability'],
        email: item.Email,
        company: item.Company,
        jobTitle: item['Job Title'],
        phone: item.Phone,
        generalNotes: item['General Notes'],
        salesperson: item.Salesperson?.[0],
        [groupByField]: item[groupByField as keyof typeof item],
        ...item
    })), [groupByField]);

    // Memoize the handleColumnsCreated callback
    const handleColumnsCreated = useMemo(() => (columns: KanbanColumn[]) => {
        kanbanColumnsRef.current = columns;
        // Check for duplicate IDs
        const ids = columns.map(col => col.id);
        const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
            console.error('Duplicate column IDs found:', duplicateIds);
        }
    }, []);

    const handleKanbanItemClick = useCallback((item: KanbanRecord) => {
        handleRowClick(item);
    }, []);

    // Memoize the column map to prevent unnecessary rerenders
    const getColumnMap = useCallback(() => {
        if (groupByField === 'Stage ID') {
            return Object.entries(statusLabels)
                .reduce((acc, [value, label]) => {
                    acc[value] = {
                        id: `stage_${value}`,
                        title: label
                    };
                    return acc;
                }, {} as Record<string, { id: string; title: string }>);
        }
        if (groupByField === 'Source Channel (from Leads)') {
            return {
                'Facebook': { id: 'source_facebook', title: 'Facebook' },
                'Instagram': { id: 'source_instagram', title: 'Instagram' },
                'LinkedIn': { id: 'source_linkedin', title: 'LinkedIn' },
                'Referral': { id: 'source_referral', title: 'Referral' },
                'Website': { id: 'source_website', title: 'Website' },
            };
        }
        if (groupByField === 'Close Probability') {
            return {
                '0': { id: 'prob_0', title: '0%' },
                '10': { id: 'prob_10', title: '10%' },
                '20': { id: 'prob_20', title: '20%' },
                '30': { id: 'prob_30', title: '30%' },
                '40': { id: 'prob_40', title: '40%' },
                '50': { id: 'prob_50', title: '50%' },
                '60': { id: 'prob_60', title: '60%' },
                '70': { id: 'prob_70', title: '70%' },
                '80': { id: 'prob_80', title: '80%' },
                '90': { id: 'prob_90', title: '90%' },
                '100': { id: 'prob_100', title: '100%' },
            };
        }
        if (groupByField === 'Salesperson') {
            return employees?.reduce((acc, employee) => {
                if (employee.id && employee.Name) {
                    acc[employee.id] = {
                        id: `salesperson_${employee.id}`,
                        title: employee.Name
                    };
                }
                return acc;
            }, {} as Record<string, { id: string; title: string }>) || {};
        }
        return undefined;
    }, [groupByField, employees]);

    // Memoize the column map itself
    const columnMap = useMemo(() => getColumnMap(), [getColumnMap]);

    // Memoize the display fields for the kanban
    const displayFields = useMemo(() => [
        { field: 'title', label: 'Name' },
        {
            field: 'dealValue',
            label: 'Deal Value',
            render: (value: any) => formatCurrency(value)
        },
        {
            field: 'closeProbability',
            label: 'Probability',
            render: (value: any) => value ? `${value}%` : '-'
        },
        { field: 'email', label: 'Email' },
        {
            field: 'salesperson',
            label: 'Salesperson',
            render: (value: any) => value ? employeeMap[value] || '-' : '-'
        }
    ], [employeeMap]);

    // Memoize the renderColumnHeader function
    const renderColumnHeader = useMemo(() => ({ title, records }: { title: string; records?: any[] }) => (
        <div className="sticky top-0 z-10 p-3 font-medium border-b border-black/40 flex items-center">
            <span className="text-gray-800 text-lg">{title}</span>
            <span className="ml-2 text-xs text-gray-500 font-normal">
                {records?.length || 0}
            </span>
        </div>
    ), []);

    // Memoize the mapped items for Kanban
    const mappedItems = useMemo(() => {
        if (!filteredOpportunities) return [];
        return mapItemsFromSortedData(filteredOpportunities);
    }, [filteredOpportunities, mapItemsFromSortedData]);

    // Memoize the renderItem function with proper dependencies
    const renderItem = useMemo(() => ({ title, id, status, dealValue, closeProbability, generalNotes, salesperson }: KanbanRecord) => (
        <div className="bg-white border-1 rounded-lg p-3 mb-2 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="mb-1.5 border-b border-black/40 pb-1.5 font-medium text-sm">
                {title}
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs ">
                <div className="flex items-center justify-between">
                    <div className="text-gray-500 font-medium mb-0.5">Prospect ID</div>
                    <div className="text-black ">Pros - {id}</div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-gray-500 mb-0.5">{
                        groupByField === 'Current Stage'
                            ? 'Current Stage'
                            : groupByField
                    }</div>
                    <div className="text-gray-700 flex items-center">
                        {
                            groupByField === 'Current Stage'
                                ? statusLabels[String(status)] || status
                                : status
                        }
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-gray-500 mb-0.5">Close Probability</div>
                    <div className="text-gray-700">{closeProbability ? `${closeProbability}%` : '30%'}</div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-gray-500 mb-0.5">Deal Value</div>
                    <div className="text-gray-700">{formatCurrency(dealValue)}</div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-gray-500 mb-0.5">Salesperson</div>
                    <div className="text-gray-700">{salesperson ? employeeMap[salesperson] || '-' : '-'}</div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-gray-500 mb-0.5">Last Name</div>
                    <div className="text-gray-700">{title}</div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-gray-500 mb-0.5">General Notes</div>
                    <div className="text-gray-700">{generalNotes}</div>
                </div>
            </div>
        </div>
    ), [employeeMap, statusLabels, formatCurrency]);

    const handleCloseActivityModal = () => {
        setActivityModalOpen(false);
    };


    const handleActivitySubmit = async (formValues: Partial<ActivityLogRecord>) => {
        try {
            // Format dates to yyyy/mm/dd
            const formatDate = (dateStr: string) => {
                if (!dateStr) return '';
                const [year, month, day] = dateStr.split('-');
                return `${year}/${month}/${day}`;
            };

            // Filter out empty values and prepare the activity log data
            const activityLogData: Partial<ActivityLogRecord> = {
                Prospect: [formValues.prospectId],
                'Log Date': formatDate(formValues.logDate),
                'Current Stage': [formValues.currentStage],
                'New Stage': [formValues.newStage],
                'Close Probability from Salesperson': formValues.closeProbability,
                'Explanation': [formValues.explanation],
                'Assigned To': formValues.assignedTo ? [formValues.assignedTo] : []
            };

            // Only add optional fields if they have values
            if (formValues.nextContactDate) {
                activityLogData['Next Contact Date'] = formatDate(formValues.nextContactDate);
            }
            if (formValues.note) {
                activityLogData.Note = formValues.note;
            }

            // Close modal immediately to prevent UI flashing
            handleCloseActivityModal();
            await Promise.all([
                // Create activity log first
                createActivityLogMutation(activityLogData),

                // Then update opportunity's current stage and assigned to
                updateOpportunityMutation(formValues.prospectId, {
                    'Current Stage': [formValues.newStage],
                    'Salesperson': formValues.assignedTo ? [formValues.assignedTo] : []
                })]);

            // Show success message
            showSnackbar('Activity created, Opportunity updated successfully', 'success', true);
        } catch (err) {
            console.error('Failed to create activity log:', err);
            showSnackbar('Failed to create activity log', 'error');
        }
    };


    // Add new callback for rendering loading skeleton rows
    const renderLoadingSkeletonRows = useCallback(() => (
        Array.from({ length: 15 }).map((_, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columnsConfig.map((column, cellIndex) => (
                    <td
                        key={cellIndex}
                        className="py-3 px-2 border-b border-r border-gray-200"
                        style={{
                            width: `var(--col-${cellIndex}-width, ${column.width || 150}px)`,
                            maxWidth: `var(--col-${cellIndex}-width, ${column.width || 150}px)`,
                        }}
                    >
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                ))}
            </tr>
        ))
    ), [columnsConfig]);

    // Handle loading or error states for stages
    if (stagesError) return <div>Error loading stages</div>;

    // Only show loading state for initial load, not during mutations
    if (!stages || !stageExplanations || !employees) return <div>Loading...</div>;

    return (
        <div className="w-full h-full text-xs pb-0">
            <div className="flex justify-between pb-0">
                <div className="flex items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <MuiButton className="cursor-pointer mr-1 flex items-center text-xs px-2 py-0.5">
                                <span>View: {viewType === 'list' ? 'List' : 'Kanban'}</span>
                                <Iconify
                                    icon="mdi:chevron-down"
                                    width={14}
                                    height={14}
                                    className="ml-1"
                                />
                            </MuiButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent sideOffset={5} align="start" className="w-40 bg-white border border-gray-200 shadow-md p-0">
                            <DropdownMenuItem
                                onClick={() => handleViewTypeChange('list')}
                                className={`cursor-pointer py-1.5 px-2 text-xs hover:bg-gray-50 ${viewType === 'list' ? "bg-blue-100" : ""}`}
                            >
                                <div className="flex items-center w-full">
                                    <Iconify
                                        icon="mdi:view-list"
                                        width={14}
                                        height={14}
                                        className="mr-2"
                                    />
                                    <span className={viewType === 'list' ? "font-medium text-blue-700" : ""}>List</span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleViewTypeChange('kanban')}
                                className={`cursor-pointer py-1.5 px-2 text-xs hover:bg-gray-50 ${viewType === 'kanban' ? "bg-blue-100" : ""}`}
                            >
                                <div className="flex items-center w-full">
                                    <Iconify
                                        icon="mdi:view-kanban"
                                        width={14}
                                        height={14}
                                        className="mr-2"
                                    />
                                    <span className={viewType === 'kanban' ? "font-medium text-blue-700" : ""}>Kanban</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Add toolbar filters */}
                    <div className="flex items-center gap-2 ml-2 pb-1">
                        <Select
                            value={currentStageFilter?.value === '' ? 'unassigned' : (currentStageFilter?.value ? String(stages?.find(s => s['Stage ID'] === currentStageFilter.value)?.id) : 'all')}
                            onValueChange={(value) => handleToolbarFilterChange('Current Stage', value === 'all' ? '' : value)}
                        >
                            <SelectTrigger className="w-[150px] h-8 text-xs focus:ring-0">
                                <SelectValue placeholder="All Stages">
                                    {currentStageFilter?.value === ''
                                        ? "Unassigned"
                                        : currentStageFilter?.value
                                            ? stages?.find(s => s['Stage ID'] === currentStageFilter.value)?.['Stage ID']
                                            : "All Stages"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stages</SelectItem>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {stages?.map((stage) => (
                                    <SelectItem key={stage.id} value={stage.id || ''}>
                                        {stage['Stage ID']}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={currentSalespersonFilter?.value === '' ? 'unassigned' : (currentSalespersonFilter?.value ? String(employees?.find(e => e.Name === currentSalespersonFilter.value)?.id) : 'all')}
                            onValueChange={(value) => handleToolbarFilterChange('Salesperson', value === 'all' ? '' : value)}
                        >
                            <SelectTrigger className="w-[150px] h-8 text-xs focus:ring-0">
                                <SelectValue placeholder="All Salespersons">
                                    {currentSalespersonFilter?.value === ''
                                        ? "Unassigned"
                                        : currentSalespersonFilter?.value
                                            ? employees?.find(e => e.Name === currentSalespersonFilter.value)?.Name
                                            : "All Salesperson"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Salespersons</SelectItem>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {employees?.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id || ''}>
                                        {employee.Name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {viewType === 'kanban' && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <MuiButton className="cursor-pointer ml-1 flex items-center text-xs px-2 py-0.5">
                                    <span>Group By: {groupByField === 'Current Stage' ? 'Current Stage' : groupByField}</span>
                                    <Iconify
                                        icon="mdi:chevron-down"
                                        width={14}
                                        height={14}
                                        className="ml-1"
                                    />
                                </MuiButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent sideOffset={5} align="start" className="w-56 bg-white border border-gray-200 shadow-md p-0">
                                <DropdownMenuItem
                                    onClick={() => handleGroupByChange('Current Stage')}
                                    className={`cursor-pointer py-1.5 px-2 text-xs hover:bg-gray-50 ${groupByField === 'Current Stage' ? "bg-blue-100" : ""}`}
                                >
                                    <div className="flex items-center w-full">
                                        <span className={groupByField === 'Current Stage' ? "font-medium text-blue-700" : ""}>Current Stage</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleGroupByChange('Source Channel (from Leads)')}
                                    className={`cursor-pointer py-1.5 px-2 text-xs hover:bg-gray-50 ${groupByField === 'Source Channel (from Leads)' ? "bg-blue-100" : ""}`}
                                >
                                    <div className="flex items-center w-full">
                                        <span className={groupByField === 'Source Channel (from Leads)' ? "font-medium text-blue-700" : ""}>Source Channel</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleGroupByChange('Close Probability')}
                                    className={`cursor-pointer py-1.5 px-2 text-xs hover:bg-gray-50 ${groupByField === 'Close Probability' ? "bg-blue-100" : ""}`}
                                >
                                    <div className="flex items-center w-full">
                                        <span className={groupByField === 'Close Probability' ? "font-medium text-blue-700" : ""}>Close Probability</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleGroupByChange('Salesperson')}
                                    className={`cursor-pointer py-1.5 px-2 text-xs hover:bg-gray-50 ${groupByField === 'Salesperson' ? "bg-blue-100" : ""}`}
                                >
                                    <div className="flex items-center w-full">
                                        <span className={groupByField === 'Salesperson' ? "font-medium text-blue-700" : ""}>Salesperson</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="flex">
                    <MuiButton
                        className="mr-1.5 text-white bg-blue-600 hover:bg-blue-700 cursor-pointer text-xs px-2 py-0.5"
                        onClick={handleAddOpportunity}
                    >
                        Add opportunity
                    </MuiButton>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <MuiButton className="cursor-pointer mr-1 flex items-center text-xs px-2 py-0.5">
                                <span>Sort</span>
                                {sortField === 'Email' && (
                                    <>
                                        <span className="mx-1 text-gray-400">|</span>
                                        <span className="text-blue-600">{sortField}</span>
                                        <Iconify
                                            icon={sortDirection === 'asc' ? "mdi:arrow-up" : "mdi:arrow-down"}
                                            width={10}
                                            height={10}
                                            className="ml-1 text-blue-600"
                                        />
                                    </>
                                )}
                            </MuiButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent sideOffset={5} align="start" className="w-56 bg-white border border-gray-200 shadow-md p-0">
                            {columnsConfig.filter(col => col.sortable).map((column) => (
                                <DropdownMenuItem
                                    key={column.field}
                                    onClick={() => handleHeaderClick(column.field)}
                                    className={`cursor-pointer py-1.5 px-2 text-xs hover:bg-gray-50 ${sortField === column.field ? "bg-blue-100" : ""}`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className={sortField === column.field ? "font-medium text-blue-700" : ""}>{column.headerName}</span>
                                        {sortField === column.field && (
                                            <Iconify
                                                icon={sortDirection === 'asc' ? "mdi:arrow-up" : "mdi:arrow-down"}
                                                width={12}
                                                height={12}
                                                className="text-blue-600"
                                            />
                                        )}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <button type="button" className="p-1 rounded-full hover:bg-gray-100">
                        <Iconify icon="mdi:magnify" width={16} height={16} />
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button type="button" className="p-1 rounded-full hover:bg-gray-100">
                                <Iconify icon="mdi:dots-horizontal" width={16} height={16} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent sideOffset={5} align="end" className="w-48 bg-white border border-gray-200 shadow-md p-0">
                            <DropdownMenuItem
                                onClick={handleFilterClick}
                                className="cursor-pointer py-1.5 px-2 text-xs hover:bg-gray-50"
                            >
                                <div className="flex items-center w-full">
                                    <Iconify
                                        icon="mdi:filter-variant"
                                        width={14}
                                        height={14}
                                        className="mr-2"
                                    />
                                    <span>Advanced Filters</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Add FilterModal component */}
            <FilterModal
                open={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                onApply={handleFilterModalApply}
                fields={filterFields}
                currentFilters={currentFilterValues}
            />

            {viewType === 'list' ? (
                <div className="h-[calc(100vh-120px)] flex flex-col">
                    <div className="flex-grow overflow-auto" ref={tableContainerRef}>
                        <DynamicTable<Partial<OpportunitiesRecord>>
                            columns={columnsConfig}
                            data={filteredOpportunities}
                            isLoading={isLoading}
                            isError={isError}
                            error={error}
                            onRowClick={handleRowClick}
                            getRowId={(row) => row.id || `row-${Math.random().toString(36).substr(2, 9)}`}
                            errorMessage="Error loading data"
                            noDataMessage="No opportunities found."
                            bottomComponent={
                                <>
                                    {hasMore ? <LoadMoreObserver onIntersect={loadMore} loading={isLoading} columns={columnsConfig} /> : null}
                                    {hasMore || isLoading ? renderLoadingSkeletonRows() : null}
                                    {!hasMore && !isLoading && filteredOpportunities.length > 0 && (
                                        <tr className="text-center  text-gray-500 text-sm">
                                            <td className="py-4" colSpan={columnsConfig.length}>
                                                All data loaded ({filteredOpportunities.length} records)
                                            </td>
                                        </tr>
                                    )}
                                </>
                            }
                        />
                    </div>
                </div>
            ) : (
                <div className="h-[calc(100vh-180px)] flex flex-col">
                    <div className="flex-grow overflow-auto">
                        <DynamicKanban
                            items={mappedItems}
                            config={{
                                groupByField,
                                maxColumns: 10,
                                allowDrag: true,
                                onColumnsCreated: handleColumnsCreated as (columns: KanbanColumn[]) => void,
                                columnMap,
                                onItemClick: handleKanbanItemClick,
                                displayFields,
                                renderColumnHeader,
                                renderItem
                            }}
                            isLoading={isLoading}
                            isError={isError}
                            error={error}
                        />
                        {hasMore && (
                            <LoadMoreObserver onIntersect={loadMore} loading={isLoading} columns={columnsConfig} />
                        )}
                    </div>
                </div>
            )}

            {/* View Drawer - Display Opportunity Details only */}
            <ViewDrawer
                open={viewDrawerOpen}
                onClose={handleCloseViewDrawer}
                title=""
                record={selectedOpportunity}
                fields={formFields}
                width={550}
                customContent={
                    selectedOpportunity && (
                        <OpportunityDetails
                            opportunity={selectedOpportunity as OpportunitiesRecord}
                            statusLabels={statusLabels}
                            stageExplanationLabels={groupedStageExplanationLabels}
                            salespersonLabels={employeeMap}
                            sourceChannelLabels={sourceChannelLabels}
                            onAddActivity={() => setActivityModalOpen(true)}
                        />
                    )
                }
                customActions={
                    <>
                        <MuiButton
                            variant="contained"
                            color="primary"
                            onClick={handleEditClick}
                            sx={{ mr: 2 }}

                        >
                            Edit
                        </MuiButton>
                        <MuiButton
                            variant="outlined"
                            onClick={handleCloseViewDrawer}
                        >
                            Close
                        </MuiButton>
                    </>
                }
            />

            {/* Edit Drawer - For editing Opportunities */}
            <EditDrawer<OpportunitiesRecord>
                open={drawerOpen}
                onClose={handleCloseDrawer}
                title={selectedOpportunity ? `Edit ${selectedOpportunity["Prospect ID"] || 'Opportunity'}` : 'Edit Opportunity'}
                initialRecord={selectedOpportunity || {}}
                submitLoading={updateOpportunityLoading}
                hideCloseIcon
                onSave={async record => {
                    if (!selectedOpportunity) {
                        return Promise.resolve();
                    }
                    return handleUpdateOpportunity(record, selectedOpportunity);
                }}
                fields={formFields}
            />
            <ActivityLogModal
                open={activityModalOpen}
                onClose={handleCloseActivityModal}
                selectedOpportunity={selectedOpportunity}
                statusLabels={statusLabels}
                stageExplanationLabels={groupedStageExplanationLabels}
                onSubmit={handleActivitySubmit}
                isLoading={activityLoading}
                employees={employees || []}
            />
            {SnackbarComponent}
        </div>
    );
});

export default OpportunitiesCRMPage; 