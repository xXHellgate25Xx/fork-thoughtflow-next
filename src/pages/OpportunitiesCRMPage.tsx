import type { OpportunitiesRecord, Stage_ExplanationRecord } from 'src/types/airtableTypes';
import type { KanbanColumn, KanbanRecord } from 'src/types/kanbanTypes';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button as MuiButton } from '@mui/material';

import { DynamicKanban } from 'src/components/ui/kanban/DynamicKanban';
import { useCreateActivityLog, useEmployees, useOpportunities, usePipelineStages, useStageExplanations, useUpdateOpportunity } from 'src/hooks/tablehooks';
import { useSnackbar } from 'src/hooks/use-snackbar';

import { FieldDef } from 'src/components/CRM/Modals/types';
import ActivityLogModal from '../components/CRM/Modals/ActivityLogModal';
import EditDrawer from '../components/CRM/Modals/EditDrawer';
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
import { opportunityFields, sourceChannelOptions } from '../config/opportunityFormFields';

type ViewType = 'list' | 'kanban';

// Add this component before the OpportunitiesCRMPage
const LoadMoreObserver = ({ onIntersect, loading }: { onIntersect: () => void, loading: boolean }) => {
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
        <div ref={observerRef} className="h-0 w-full" />
    );
};

const OpportunitiesCRMPage = memo(() => {
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const { records: stages, isLoading: stagesLoading, isError: stagesError } = usePipelineStages();
    const { records: stageExplanations, isLoading: explanationsLoading } = useStageExplanations();
    const { records: employees, isLoading: employeesLoading } = useEmployees();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [activityModalOpen, setActivityModalOpen] = useState(false);
    const [sortField, setSortField] = useState<string>('Prospect ID');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [viewType, setViewType] = useState<ViewType>('list');
    const [selectedOpportunity, setSelectedOpportunity] = useState<Partial<OpportunitiesRecord> | null>(null);
    const [groupByField, setGroupByField] = useState<string>('Stage ID');
    const kanbanColumnsRef = useRef<any[]>([]);
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
    } = useOpportunities({
        sort: [{
            field: sortField,
            direction: sortDirection
        }],
        limit: 10000
    });

    const { mutate: updateOpportunityMutation, isLoading: updateOpportunityLoading } = useUpdateOpportunity();
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
            console.log(changedFields);
            // Only proceed if there are changes
            if (Object.keys(changedFields).length > 0) {

                if (changedFields['Salesperson (linked)']) {
                    changedFields['Salesperson (linked)'] = [changedFields['Salesperson (linked)']];
                }
                if (changedFields['Current Stage (linked)']) {
                    changedFields['Current Stage (linked)'] = [changedFields['Current Stage (linked)']];
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

    // Handle column header click for sorting
    const handleHeaderClick = useCallback((field: string) => {
        const newDirection = sortField === field
            ? (sortDirection === 'asc' ? 'desc' : 'asc')
            : 'asc';

        // Update sort parameters
        setSortField(field);
        setSortDirection(newDirection);

        // Reset and refetch with new sort parameters
        resetRecords({
            sort: [{
                field,
                direction: newDirection
            }],
            limit: 10000
        });
        // resetRecords();
        refetch();
    }, [sortField, sortDirection, resetRecords, refetch]);

    // Define table columns
    const columnsConfig: ColumnDef<any>[] = [
        {
            field: 'Prospect ID',
            headerName: 'Prospect ID',
            width: 70,
            sortable: true,
            onHeaderClick: () => handleHeaderClick('Prospect ID'),
            sortDirection: sortField === 'Prospect ID' ? sortDirection : undefined,
        },
        {
            field: 'Last Name',
            headerName: 'Last Name',
            width: 70,
            sortable: true,
            sortDirection: sortField === 'Last Name' ? sortDirection : undefined,
            onHeaderClick: () => handleHeaderClick('Last Name'),
        },
        {
            field: 'Email',
            headerName: 'Email',
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
            field: 'Current Stage (linked)',
            headerName: 'Current Stage',
            sortable: true,
            sortDirection: sortField === 'Current Stage (linked)' ? sortDirection : undefined,
            onHeaderClick: () => handleHeaderClick('Current Stage (linked)'),
            renderCell: (row) => (
                <span className="border-1 border-black/50 text-gray-700 font-normal px-2 py-1 text-xs inline-block rounded-md overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                    {statusLabels[row['Current Stage (linked)']] || row['Current Stage (linked)']}
                </span>
            ),
        },
        {
            field: 'Deal Value',
            headerName: 'Deal Value',
            width: 70,
            sortable: true,
            sortDirection: sortField === 'Deal Value' ? sortDirection : undefined,
            onHeaderClick: () => handleHeaderClick('Deal Value'),
            renderCell: (row) => formatCurrency(row['Deal Value']) ?? "-",
        },
        {
            field: 'Close Probability',
            headerName: 'Close Probability',
            width: 80,
            sortable: true,
            sortDirection: sortField === 'Close Probability' ? sortDirection : undefined,
            onHeaderClick: () => handleHeaderClick('Close Probability'),
            renderCell: (row) => row['Close Probability'] ? `${row['Close Probability'] * 100}%` : '-',
        },
        {
            field: 'General Notes',
            headerName: 'General Notes',
            sortable: true,
            sortDirection: sortField === 'General Notes' ? sortDirection : undefined,
            onHeaderClick: () => handleHeaderClick('General Notes'),
            renderCell: (row) => (
                <span className="block overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]" title={row['General Notes']}>
                    {row['General Notes']}
                </span>
            ),
        },
        // {
        //     field: 'Salesperson (linked)',
        //     headerName: 'Salesperson',
        //     sortable: true,
        //     sortDirection: sortField === 'Salesperson (linked)' ? sortDirection : undefined,
        //     renderHeader: () => (
        //         <button
        //             type="button"
        //             className="flex items-center hover:text-blue-700"
        //             onClick={() => handleHeaderClick('Salesperson (linked)')}
        //         >
        //             Salesperson
        //             {sortField === 'Salesperson (linked)' && (
        //                 <Iconify
        //                     icon={sortDirection === 'asc' ? "mdi:arrow-up" : "mdi:arrow-down"}
        //                     width={12}
        //                     height={12}
        //                     className="ml-1.5"
        //                 />
        //             )}
        //         </button>
        //     ),
        //     renderCell: (row) => {
        //         const salespersonId = row['Salesperson (linked)']?.[0];
        //         return salespersonId ? employeeMap[salespersonId] || '-' : '-';
        //     },
        // },
    ];

    // Define form fields for the drawer
    const formFields: FieldDef<OpportunitiesRecord>[] = opportunityFields.map(field => {
        if (field.name === 'Current Stage (linked)') {
            return {
                ...field,
                options: Object.entries(statusLabels).map(([value, label]) => ({
                    value,
                    label
                })),
                disabled: true
            };
        }
        if (field.name === 'Salesperson (linked)') {

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

    // Memoize callbacks to prevent unnecessary rerenders
    const handleColumnsCreated = useCallback((columns: KanbanColumn[]) => {
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
        if (groupByField === 'Source Channel') {
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
        if (groupByField === 'Salesperson (linked)') {
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

    // Memoize the item mapping function for sorted data
    const mapItemsFromSortedData = useCallback((data: any[]) => data.map(item => ({
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
        salesperson: item['Salesperson (linked)']?.[0],
        [groupByField]: item[groupByField as keyof typeof item],
        ...item
    })), [groupByField]);

    // Memoize the renderColumnHeader function
    const renderColumnHeader = useCallback((column: any) => (
        <div className="sticky top-0 z-10 p-3 font-medium border-b border-black/40 flex items-center">
            <span className="text-gray-800 text-lg">{column.title}</span>
            <span className="ml-2 text-xs text-gray-500 font-normal">
                {column.records?.length || 0}
            </span>
        </div>
    ), []);

    // Memoize the renderItem function
    const renderItem = useCallback((item: any) => (
        <div className="bg-white border-1 rounded-lg p-3 mb-2 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="mb-1.5 border-b border-black/40 pb-1.5 font-medium text-sm">
                {item.title}
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs ">
                <div className="flex items-center justify-between">
                    <div className="text-gray-500 font-medium mb-0.5">Prospect ID</div>
                    <div className="text-black ">Pros - {item.id}</div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-gray-500 mb-0.5">{
                        groupByField === 'Current Stage (linked)'
                            ? 'Current Stage'
                            : groupByField
                    }</div>
                    <div className="text-gray-700 flex items-center">
                        {
                            groupByField === 'Current Stage (linked)'
                                ? statusLabels[String(item[groupByField])] || item[groupByField]
                                : item[groupByField]
                        }
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-gray-500 mb-0.5">Close Probability</div>
                    <div className="text-gray-700">{item.closeProbability ? `${item.closeProbability}%` : '30%'}</div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-gray-500 mb-0.5">Deal Value</div>
                    <div className="text-gray-700">{formatCurrency(item.dealValue)}</div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-gray-500 mb-0.5">Salesperson</div>
                    <div className="text-gray-700">{item.salesperson ? employeeMap[item.salesperson] || '-' : '-'}</div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-gray-500 mb-0.5">Last Name</div>
                    <div className="text-gray-700">{item.title}</div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-gray-500 mb-0.5">General Notes</div>
                    <div className="text-gray-700">{item.generalNotes}</div>
                </div>
            </div>
        </div>
    ), [groupByField, employeeMap]);

    const handleCloseActivityModal = () => {
        setActivityModalOpen(false);
    };

    const handleOpenActivityModal = () => {
        if (!selectedOpportunity) return;

        // Just open the modal - the component will handle its own state
        setActivityModalOpen(true);
    };

    const handleActivitySubmit = async (formValues: Record<string, any>) => {
        try {
            // Format dates to yyyy/mm/dd
            const formatDate = (dateStr: string) => {
                if (!dateStr) return '';
                const [year, month, day] = dateStr.split('-');
                return `${year}/${month}/${day}`;
            };

            // Filter out empty values and prepare the activity log data
            const activityLogData: Record<string, any> = {
                Prospect: [formValues.prospectId],
                'Log Date': formatDate(formValues.logDate),
                'Current Stage': [formValues.currentStage],
                'New Stage': [formValues.newStage],
                'Close Probability from Salesperson': formValues.closeProbability,
                'Explanation': [formValues.explanation]
            };

            // Only add optional fields if they have values
            if (formValues.nextContactDate) {
                activityLogData['Next Contact Date'] = formatDate(formValues.nextContactDate);
            }
            if (formValues.note) {
                activityLogData.Note = formValues.note;
            }

            await createActivityLogMutation(activityLogData).then(async () => {
                // Update opportunity's current stage
                await updateOpportunityMutation(formValues.prospectId, {
                    'Current Stage (linked)': [formValues.newStage]
                }).then(() => {
                    showSnackbar('Activity created, Opportunity updated successfully', 'success', true);
                });
            }).catch(() => {
                showSnackbar('Failed to create activity log', 'error');
            }).finally(() => {
                handleCloseActivityModal();
            });
        } catch (err) {
            console.error('Failed to create activity log:', err);
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
    if (stagesLoading || explanationsLoading) return <div>Loading...</div>;
    if (stagesError) return <div>Error loading stages</div>;

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
                                onClick={() => setViewType('list')}
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
                                onClick={() => setViewType('kanban')}
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

                    {viewType === 'kanban' && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <MuiButton className="cursor-pointer ml-1 flex items-center text-xs px-2 py-0.5">
                                    <span>Group By: {groupByField === 'Current Stage (linked)' ? 'Current Stage' : groupByField}</span>
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
                                    onClick={() => setGroupByField('Current Stage (linked)')}
                                    className={`cursor-pointer py-1.5 px-2 text-xs hover:bg-gray-50 ${groupByField === 'Current Stage (linked)' ? "bg-blue-100" : ""}`}
                                >
                                    <div className="flex items-center w-full">
                                        <span className={groupByField === 'Current Stage (linked)' ? "font-medium text-blue-700" : ""}>Current Stage</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setGroupByField('Source Channel')}
                                    className={`cursor-pointer py-1.5 px-2 text-xs hover:bg-gray-50 ${groupByField === 'Source Channel' ? "bg-blue-100" : ""}`}
                                >
                                    <div className="flex items-center w-full">
                                        <span className={groupByField === 'Source Channel' ? "font-medium text-blue-700" : ""}>Source Channel</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setGroupByField('Close Probability')}
                                    className={`cursor-pointer py-1.5 px-2 text-xs hover:bg-gray-50 ${groupByField === 'Close Probability' ? "bg-blue-100" : ""}`}
                                >
                                    <div className="flex items-center w-full">
                                        <span className={groupByField === 'Close Probability' ? "font-medium text-blue-700" : ""}>Close Probability</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setGroupByField('Salesperson (linked)')}
                                    className={`cursor-pointer py-1.5 px-2 text-xs hover:bg-gray-50 ${groupByField === 'Salesperson (linked)' ? "bg-blue-100" : ""}`}
                                >
                                    <div className="flex items-center w-full">
                                        <span className={groupByField === 'Salesperson (linked)' ? "font-medium text-blue-700" : ""}>Salesperson</span>
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

                    {viewType !== 'kanban' && (
                        <MuiButton className="mr-1 text-xs px-2 py-0.5">
                            Group
                        </MuiButton>
                    )}

                    <MuiButton className="mr-1 cursor-pointer text-xs px-2 py-0.5">
                        Filter
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

                    <button type="button" className="p-1 rounded-full hover:bg-gray-100">
                        <Iconify icon="mdi:dots-horizontal" width={16} height={16} />
                    </button>
                </div>
            </div>

            {viewType === 'list' ? (
                <div className="h-[calc(100vh-120px)] flex flex-col">
                    <div className="flex-grow overflow-auto">
                        <DynamicTable<Partial<OpportunitiesRecord>>
                            columns={columnsConfig}
                            data={opportunities}
                            isLoading={isLoading}
                            isError={isError}
                            error={error}
                            onRowClick={handleRowClick}
                            getRowId={(row) => row.id || `row-${Math.random().toString(36).substr(2, 9)}`}
                            errorMessage="Error loading data"
                            noDataMessage="No opportunities found."
                            bottomComponent={
                                <>
                                    {hasMore ? <LoadMoreObserver onIntersect={loadMore} loading={isLoading} /> : null}
                                    {hasMore || isLoading ? renderLoadingSkeletonRows() : null}
                                    {!hasMore && !isLoading && opportunities.length > 0 && (
                                        <tr className="text-center  text-gray-500 text-sm">
                                            <td colSpan={columnsConfig.length} className="py-4">
                                                All data loaded ({opportunities.length} records)
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
                            items={mapItemsFromSortedData(opportunities)}
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
                            <LoadMoreObserver onIntersect={loadMore} loading={isLoading} />
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
            />
            {SnackbarComponent}
        </div>
    );
});

export default OpportunitiesCRMPage; 