import type { OpportunitiesRecord, Stage_ExplanationRecord } from 'src/types/airtableTypes';
import type { KanbanColumn, KanbanRecord } from 'src/types/kanbanTypes';

import { memo, useCallback, useMemo, useRef, useState } from 'react';

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
    const { records: opportunities, isLoading, isError, error, refetch } = useOpportunities({
        sort: [{
            field: sortField,
            direction: sortDirection
        }],
        limit: 2000
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
    // Memoize sorted data
    const sortedData = useMemo(() => {
        if (!opportunities) return [];
        return [...opportunities].sort((a, b) => {
            // Use type assertion since we know these fields exist
            const aValue = a[sortField as keyof typeof a];
            const bValue = b[sortField as keyof typeof b];

            // Handle null/undefined values (they should be at the end)
            if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
            if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

            // Handle numbers
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }

            // Handle strings and other values
            const aString = String(aValue).toLowerCase();
            const bString = String(bValue).toLowerCase();

            return sortDirection === 'asc'
                ? aString.localeCompare(bString)
                : bString.localeCompare(aString);
        });
    }, [opportunities, sortField, sortDirection]);

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
    const handleHeaderClick = (field: string) => {
        if (sortField === field) {
            // Toggle direction if same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new field and default to ascending
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Define table columns
    const columnsConfig: ColumnDef<any>[] = [
        {
            field: 'Prospect ID',
            headerName: 'Prospect ID',
            sortable: true,
            renderHeader: () => (
                <button
                    type="button"
                    className="flex items-center hover:text-blue-700"
                    onClick={() => handleHeaderClick('Prospect ID')}
                >
                    Prospect ID
                    {sortField === 'Prospect ID' && (
                        <Iconify
                            icon={sortDirection === 'asc' ? "mdi:arrow-up" : "mdi:arrow-down"}
                            width={12}
                            height={12}
                            className="ml-1.5"
                        />
                    )}
                </button>
            ),
        },
        {
            field: 'Last Name',
            headerName: 'Last Name',
            sortable: true,
            sortDirection: sortField === 'Last Name' ? sortDirection : undefined,
            renderHeader: () => (
                <button
                    type="button"
                    className="flex items-center hover:text-blue-700"
                    onClick={() => handleHeaderClick('Last Name')}
                >
                    Last Name
                    {sortField === 'Last Name' && (
                        <Iconify
                            icon={sortDirection === 'asc' ? "mdi:arrow-up" : "mdi:arrow-down"}
                            width={12}
                            height={12}
                            className="ml-1.5"
                        />
                    )}
                </button>
            ),
        },
        {
            field: 'Email',
            headerName: 'Email',
            sortable: true,
            sortDirection: sortField === 'Email' ? sortDirection : undefined,
            renderHeader: () => (
                <button
                    type="button"
                    className="flex items-center hover:text-blue-700 "
                    onClick={() => handleHeaderClick('Email')}
                >
                    Email
                    {sortField === 'Email' && (
                        <Iconify
                            icon={sortDirection === 'asc' ? "mdi:arrow-up" : "mdi:arrow-down"}
                            width={12}
                            height={12}
                            className="ml-1.5"
                        />
                    )}
                </button>
            ),
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
            renderHeader: () => (
                <button
                    type="button"
                    className="flex items-center hover:text-blue-700"
                    onClick={() => handleHeaderClick('Current Stage (linked)')}
                >
                    Current Stage
                    {sortField === 'Current Stage (linked)' && (
                        <Iconify
                            icon={sortDirection === 'asc' ? "mdi:arrow-up" : "mdi:arrow-down"}
                            width={12}
                            height={12}
                            className="ml-1.5"
                        />
                    )}
                </button>
            ),
            renderCell: (row) => (
                <span className="border-1 border-black/50 text-gray-700 font-normal px-2 py-1 text-xs inline-block rounded-md overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                    {statusLabels[row['Current Stage (linked)']] || row['Current Stage (linked)']}
                </span>
            ),
        },
        {
            field: 'Deal Value',
            headerName: 'Deal Value',
            sortable: true,
            sortDirection: sortField === 'Deal Value' ? sortDirection : undefined,
            renderHeader: () => (
                <button
                    type="button"
                    className="flex items-center hover:text-blue-700"
                    onClick={() => handleHeaderClick('Deal Value')}
                >
                    Deal Value
                    {sortField === 'Deal Value' && (
                        <Iconify
                            icon={sortDirection === 'asc' ? "mdi:arrow-up" : "mdi:arrow-down"}
                            width={12}
                            height={12}
                            className="ml-1.5"
                        />
                    )}
                </button>
            ),
            renderCell: (row) => formatCurrency(row['Deal Value']) ?? "-",
        },
        {
            field: 'Close Probability',
            headerName: 'Close Probability',
            sortable: true,
            sortDirection: sortField === 'Close Probability' ? sortDirection : undefined,
            renderHeader: () => (
                <button
                    type="button"
                    className="  hover:text-blue-700 block overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]"
                    onClick={() => handleHeaderClick('Close Probability')}
                >
                    Close Probability
                    {sortField === 'Close Probability' && (
                        <Iconify
                            icon={sortDirection === 'asc' ? "mdi:arrow-up" : "mdi:arrow-down"}
                            width={12}
                            height={12}
                            className="ml-1.5"
                        />
                    )}
                </button>
            ),
            renderCell: (row) => row['Close Probability'] ? `${row['Close Probability'] * 100}%` : '-',
        },
        {
            field: 'General Notes',
            headerName: 'General Notes',
            sortable: true,
            sortDirection: sortField === 'General Notes' ? sortDirection : undefined,
            renderHeader: () => (
                <button
                    type="button"
                    className="flex items-center hover:text-blue-700"
                    onClick={() => handleHeaderClick('General Notes')}
                >
                    General Notes
                    {sortField === 'General Notes' && (
                        <Iconify
                            icon={sortDirection === 'asc' ? "mdi:arrow-up" : "mdi:arrow-down"}
                            width={12}
                            height={12}
                            className="ml-1.5"
                        />
                    )}
                </button>
            ),
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
        console.log('Kanban columns created:', columns);
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

    // Handle loading or error states for stages
    if (stagesLoading || explanationsLoading) return <div>Loading...</div>;
    if (stagesError) return <div>Error loading stages</div>;

    return (
        <div className="w-full text-xs">
            <div className="flex justify-between mb-2">
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
                <DynamicTable<Partial<OpportunitiesRecord>>
                    columns={columnsConfig}
                    data={sortedData}
                    isLoading={isLoading}
                    isError={isError}
                    error={error}
                    onRowClick={handleRowClick}
                    getRowId={(row) => row.id || `row-${Math.random().toString(36).substr(2, 9)}`}
                    loadingMessage="Loading opportunities..."
                    errorMessage="Error loading data"
                    noDataMessage="No opportunities found."
                />
            ) : (
                <div className="w-full h-[calc(100vh-180px)] overflow-x-auto flex">
                    <DynamicKanban
                        items={mapItemsFromSortedData(sortedData)}
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
        </div >
    );
});

export default OpportunitiesCRMPage; 