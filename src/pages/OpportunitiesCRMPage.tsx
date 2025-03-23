import type { KanbanColumn, KanbanRecord } from 'src/types/kanbanTypes';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Button as MuiButton, Select, TextField, useTheme } from '@mui/material';

import { useCreateActivityLog, useOpportunities, usePipelineStages } from 'src/hooks/tablehooks';

import { DynamicKanban } from 'src/components/ui/kanban/DynamicKanban';

import DynamicTable from '../components/DynamicTable';
import EditDrawer from '../components/EditDrawer';
import { Iconify } from '../components/iconify';
import StageTransitionForm from '../components/StageTransitionForm';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import ViewDrawer from '../components/ViewDrawer';
import { supabase } from '../lib/supabase';

import type { ColumnDef } from '../components/DynamicTable';
import type { FieldDef } from '../components/EditDrawer';
import OpportunityDetails from '../components/OpportunityDetails';
import type { Pipeline_StagesRecord } from '../types/supabase';

// Create a simple toast implementation if react-hot-toast isn't available
const toast = ({ title, status }: { title: string, status: 'success' | 'error' }) => {
    console.log(`[${status}] ${title}`);
};

type ViewType = 'list' | 'kanban';
const OpportunitiesCRMPage = memo(() => {
    const theme = useTheme();
    const { records: opportunities, isLoading, isError, error, refetch } = useOpportunities();
    const { records: stages, isLoading: stagesLoading, isError: stagesError } = usePipelineStages();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [activityModalOpen, setActivityModalOpen] = useState(false);
    const [activityFormValues, setActivityFormValues] = useState<Record<string, any>>({});
    const [sortField, setSortField] = useState<string>('Last Name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [viewType, setViewType] = useState<ViewType>('list');
    const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
    const [groupByField, setGroupByField] = useState<string>('Stage ID');
    const kanbanColumnsRef = useRef<any[]>([]);
    const [stageTransitionModalOpen, setStageTransitionModalOpen] = useState(false);
    const [isCreatingActivity, setIsCreatingActivity] = useState(false);
    const { mutate: createActivityLogMutation, isLoading: activityLoading } = useCreateActivityLog();

    // Map stages to statusLabels
    const statusLabels = stages.reduce((acc, stage) => {
        if (stage.id && stage["Stage ID"]) {
            acc[stage.id] = stage["Stage ID"]; // Assuming stage has 'id' and 'label' properties
            return acc;
        }
        return acc;
    }, {} as Record<string, string>);

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

    const handleRowClick = useCallback((opportunity: any) => {
        // Set selected opportunity
        setSelectedOpportunity(opportunity);

        // Map table columns to form fields
        const defaultValues: Record<string, any> = {
            prospectId: opportunity['Prospect ID'] || '',
            lastName: opportunity['Last Name'] || '',
            dealValue: opportunity['Deal Value'] || 0,
            email: opportunity.Email || '',
            company: opportunity.Company || '',
            jobTitle: opportunity['Job Title'] || '',
            phone: opportunity.Phone || '',
            sourceChannel: opportunity['Source Channel'] || '',
            spouse: opportunity.Spouse || '',
            generalNotes: opportunity['General Notes'] || '',
            currentStage: opportunity['Current Stage (linked)'] || '01-lead',
        };

        // Set form values state
        setFormValues(defaultValues);

        // Open view drawer instead of edit drawer
        setViewDrawerOpen(true);
    }, []);

    const handleCloseViewDrawer = useCallback(() => {
        setViewDrawerOpen(false);
        // Clear states after drawer is closed
        setTimeout(() => {
            if (!drawerOpen) {
                setSelectedOpportunity(null);
                setFormValues({});
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
                setFormValues({});
            }
        }, 300); // Small delay to ensure drawer animation completes
    }, [viewDrawerOpen]);

    const handleInputChange = (field: string, value: any) => {
        // Update form values
        setFormValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = (record: Record<string, any>): void => {
        // Map form fields back to opportunity format if needed
        const updatedOpportunity = {
            ...selectedOpportunity,
            'Last Name': formValues.lastName,
            'Deal Value': formValues.dealValue,
            'Email': formValues.email,
            'Company': formValues.company,
            'Job Title': formValues.jobTitle,
            'Phone': formValues.phone,
            'Source Channel': formValues.sourceChannel,
            'Spouse': formValues.spouse,
            'General Notes': formValues.generalNotes,
            'Current Stage (linked)': formValues.currentStage,
        };

        console.log('Save', updatedOpportunity);
        setDrawerOpen(false);

        // Clear states after drawer is closed
        setTimeout(() => {
            setSelectedOpportunity(null);
            setFormValues({});
        }, 300); // Small delay to ensure drawer animation completes
    };

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
            renderCell: (row) => row['Close Probability'] ? `${row['Close Probability']}%` : '-',
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
    ];

    // Define form fields for the drawer
    const formFields: FieldDef[] = [
        {
            name: 'lastName',
            label: 'Last Name',
        },
        {
            name: 'dealValue',
            label: 'Deal Value',
            type: 'currency',
        },
        {
            name: 'currentStage',
            label: 'Current Stage',
            type: 'select',
            options: Object.entries(statusLabels)
                .map(([value, label]) => ({
                    value,
                    label
                })),
        },
        {
            name: 'email',
            label: 'Email',
        },
        {
            name: 'company',
            label: 'Company',
        },
        {
            name: 'jobTitle',
            label: 'Job Title',
        },
        {
            name: 'phone',
            label: 'Phone',
        },
        {
            name: 'sourceChannel',
            label: 'Source Channel',
            type: 'select',
            options: [
                { value: 'Facebook', label: 'Facebook' },
                { value: 'Instagram', label: 'Instagram' },
                { value: 'LinkedIn', label: 'LinkedIn' },
                { value: 'Referral', label: 'Referral' },
                { value: 'Website', label: 'Website' },
            ],
        },
        {
            name: 'spouse',
            label: 'Spouse',
        },
        {
            name: 'generalNotes',
            label: 'General Notes',
            type: 'textarea',
            rows: 4,
        },
    ];

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

    const handleKanbanItemMove = useCallback((item: KanbanRecord, sourceColumn: string, targetColumn: string) => {
        // In a real app, you would update the item in your database
        console.log(`Moved ${item.title} from ${sourceColumn} to ${targetColumn}`);

        // Extract the value from the column ID based on the groupByField
        let newValue = '';

        if (groupByField === 'Current Stage (linked)') {
            // Remove the 'column-stage_' prefix
            newValue = targetColumn.replace('column-stage_', '');
        } else if (groupByField === 'Source Channel') {
            // Remove the 'column-source_' prefix and capitalize the value
            const sourceName = targetColumn.replace('column-source_', '');
            newValue = sourceName.charAt(0).toUpperCase() + sourceName.slice(1);
        } else if (groupByField === 'Close Probability') {
            // Remove the 'column-prob_' prefix
            newValue = targetColumn.replace('column-prob_', '');
        } else {
            // Default - just remove 'column-' prefix
            newValue = targetColumn.replace('column-', '');
        }

        // Here you would make an API call to update the status or field value
        // For now, we just log the change
        console.log(`New ${groupByField}: ${newValue}`);

        // The updated item with the new field value
        const updatedItem = {
            ...item,
            [groupByField]: newValue
        };

        console.log('Updated item:', updatedItem);
    }, [groupByField]);

    // Memoize the column map to prevent unnecessary rerenders
    const getColumnMap = useCallback(() => {
        if (groupByField === 'Stage ID') {
            return Object.entries(statusLabels)
                .reduce((acc, [value, label]) => {
                    acc[value] = {
                        id: `stage_${value}`, // Ensure this ID is unique
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
        return undefined;
    }, [groupByField]);

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
        { field: 'email', label: 'Email' }
    ], []);

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
                    <div className="text-gray-500 mb-0.5">Last Name</div>
                    <div className="text-gray-700">{item.title}</div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-gray-500 mb-0.5">General Notes</div>
                    <div className="text-gray-700">{item.generalNotes}</div>
                </div>
            </div>
        </div>
    ), [groupByField]);

    const handleCloseActivityModal = () => {
        setActivityModalOpen(false);
    };

    const handleOpenActivityModal = () => {
        if (!selectedOpportunity) return;

        // Just open the modal - the component will handle its own state
        setActivityModalOpen(true);
    };

    const handleActivityInputChange = (field: string, value: any) => {
        setActivityFormValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveActivity = async () => {
        try {
            await createActivityLogMutation({
                Prospect: [activityFormValues.prospectId],
                'Log Date': activityFormValues.logDate,
                'Current Stage': [activityFormValues.currentStage],
                'New Stage': [activityFormValues.newStage],
                'Next Contact Date': activityFormValues.nextContactDate,
                'Note': activityFormValues.note
            });

            handleCloseActivityModal();
            // Optionally refresh opportunities data
            refetch();
        } catch (err) {
            console.error('Failed to create activity log:', err);
        }
    };

    // Handle opening the stage transition modal
    const handleOpenStageTransition = useCallback((opportunity: KanbanRecord) => {
        // Convert the KanbanRecord to an OpportunitiesRecord format
        const opportunityRecord = {
            id: opportunity.id,
            'Prospect ID': opportunity.id,
            'Last Name': opportunity.title || '',
            'First Name': opportunity.firstName || '',
            'Email': opportunity.email || '',
            'Current Stage (linked)': opportunity.status ? [opportunity.status] : [],
            'Close Probability': opportunity.closeProbability || 0,
            'Deal Value': opportunity.dealValue || 0,
            'Phone': opportunity.phone || '',
            'Company': opportunity.company || '',
            'Job Title': opportunity.jobTitle || '',
            'General Notes': opportunity.generalNotes || '',
            'Source Channel': opportunity.sourceChannel || '',
            'Spouse': opportunity.spouse || 0,
            createdTime: opportunity.createdAt || '',
            lastModifiedTime: opportunity.updatedAt || ''
        };

        setSelectedOpportunity(opportunityRecord);
        setStageTransitionModalOpen(true);
    }, []);

    // Handle closing the stage transition modal
    const handleCloseStageTransition = useCallback(() => {
        setStageTransitionModalOpen(false);
        setSelectedOpportunity(null);
    }, []);

    // Handle saving the stage transition
    const handleSaveStageTransition = useCallback(async (values: {
        stageId: string;
        closeProbability: number;
        estimatedCloseDate: Date | null;
        comments: string;
    }) => {
        if (!selectedOpportunity) return;

        setIsCreatingActivity(true);
        try {
            // Update the opportunity with new stage and probability
            await supabase
                .from('opportunities')
                .update({
                    stage_id: values.stageId,
                    close_probability: values.closeProbability,
                    estimated_close_date: values.estimatedCloseDate,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedOpportunity.id);

            // Create activity log for the stage change
            if (values.comments) {
                await supabase
                    .from('activity_log')
                    .insert({
                        opportunity_id: selectedOpportunity.id,
                        activity_type: 'stage_change',
                        notes: values.comments,
                        created_at: new Date().toISOString()
                    });
            }

            toast({
                title: 'Stage updated successfully',
                status: 'success'
            });

            // Refresh opportunities data
            refetch();
            handleCloseStageTransition();
        } catch (err) {
            console.error('Error updating stage:', err);
            toast({
                title: 'Failed to update stage',
                status: 'error'
            });
        } finally {
            setIsCreatingActivity(false);
        }
    }, [selectedOpportunity, refetch, handleCloseStageTransition]);

    // Define activity form component as a separate component with its own state
    const ActivityLogModal = () => {
        // Local state for the form values
        const [localFormValues, setLocalFormValues] = useState<Record<string, any>>(() => ({
            prospectId: selectedOpportunity?.id || '',
            logDate: new Date().toISOString().split('T')[0],
            currentStage: selectedOpportunity?.['Current Stage (linked)'] || '',
            newStage: selectedOpportunity?.['Current Stage (linked)'] || '',
            nextContactDate: '',
            note: '',
        }));

        // Update local state when selectedOpportunity changes
        useEffect(() => {
            if (selectedOpportunity && activityModalOpen) {
                setLocalFormValues({
                    prospectId: selectedOpportunity.id,
                    logDate: new Date().toISOString().split('T')[0],
                    currentStage: selectedOpportunity['Current Stage (linked)'] || '',
                    newStage: selectedOpportunity['Current Stage (linked)'] || '',
                    nextContactDate: '',
                    note: '',
                });
            }
        }, [selectedOpportunity, activityModalOpen]);

        // Local handlers
        const handleLocalInputChange = (field: string, value: any) => {
            setLocalFormValues(prev => ({
                ...prev,
                [field]: value
            }));
        };

        const handleLocalSave = async () => {
            try {
                await createActivityLogMutation({
                    Prospect: [localFormValues.prospectId],
                    'Log Date': localFormValues.logDate,
                    'Current Stage': [localFormValues.currentStage],
                    'New Stage': [localFormValues.newStage],
                    'Next Contact Date': localFormValues.nextContactDate,
                    'Note': localFormValues.note
                });

                handleCloseActivityModal();
                // Optionally refresh opportunities data
                refetch();
            } catch (err) {
                console.error('Failed to create activity log:', err);
            }
        };

        return (
            <Dialog
                open={activityModalOpen}
                onClose={handleCloseActivityModal}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Create New Activity</DialogTitle>
                <DialogContent>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            py: 2,
                        }}
                    >
                        <TextField
                            label="Log Date"
                            type="date"
                            fullWidth
                            value={localFormValues.logDate || ''}
                            onChange={(e) => handleLocalInputChange('logDate', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <FormControl fullWidth disabled>
                            <InputLabel shrink>Current Stage</InputLabel>
                            <TextField
                                label="Current Stage"
                                value={stages.find(s => s.id === localFormValues.currentStage)?.['Stage Name'] || ''}
                                disabled
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel shrink>New Stage</InputLabel>
                            <Select
                                value={localFormValues.newStage || ''}
                                onChange={(e) => handleLocalInputChange('newStage', e.target.value)}
                                displayEmpty
                                label="New Stage"
                                inputProps={{ 'aria-label': 'New Stage' }}
                            >
                                {Object.entries(statusLabels)
                                    .map(([value, label]) => (
                                        <MenuItem key={value} value={value}>
                                            {label}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Next Contact Date"
                            type="date"
                            fullWidth
                            value={localFormValues.nextContactDate || ''}
                            onChange={(e) => handleLocalInputChange('nextContactDate', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <TextField
                            label="Note"
                            multiline
                            rows={4}
                            fullWidth
                            value={localFormValues.note || ''}
                            onChange={(e) => handleLocalInputChange('note', e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <MuiButton variant="text" onClick={handleCloseActivityModal}>Cancel</MuiButton>
                    <MuiButton variant="contained" color="primary" onClick={handleLocalSave} disabled={activityLoading}>
                        {activityLoading ? 'Saving...' : 'Save Activity'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        );
    };

    // Handle loading or error states for stages
    if (stagesLoading) return <div>Loading stages...</div>;
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
                <DynamicTable
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
                            onItemMove: handleKanbanItemMove,
                            onItemStageUpdate: handleOpenStageTransition,
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

            {/* View Drawer - Display only */}
            <ViewDrawer
                open={viewDrawerOpen}
                onClose={handleCloseViewDrawer}
                title=""
                record={formValues}
                fields={formFields}
                width={550}
                customContent={
                    selectedOpportunity && (
                        <OpportunityDetails
                            opportunity={selectedOpportunity}
                            useExistingActivityList
                            prospectId={selectedOpportunity["Prospect ID"]}
                            maxActivityHeight={400}
                            formatCurrency={formatCurrency}
                            statusLabels={statusLabels}
                            onAddActivity={handleOpenActivityModal}
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

            {/* Edit Drawer - For editing, kept for compatibility */}
            <EditDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                title={selectedOpportunity ? `Edit ${selectedOpportunity["Prospect ID"] || 'Opportunity'}` : 'Edit Opportunity'}
                record={formValues}
                onSave={handleSave}
                onInputChange={handleInputChange}
                fields={formFields}
                customActions={
                    <MuiButton
                        variant="contained"
                        color="primary"
                        onClick={handleOpenActivityModal}
                        sx={{ mr: 2 }}
                    >
                        Add Activity
                    </MuiButton>
                }
            />

            <EditDrawer
                open={stageTransitionModalOpen && !drawerOpen && !viewDrawerOpen}
                onClose={handleCloseStageTransition}
                title="Update Activity Stage"
                onSave={(record) => { console.log('save', record) }}
                onInputChange={(field, value) => { console.log('input changed', field, value) }}
                customContent={
                    selectedOpportunity && (
                        <StageTransitionForm
                            opportunity={selectedOpportunity}
                            pipelineStages={stages.filter(stage => !!stage.id) as Pipeline_StagesRecord[]}
                            onSubmit={handleSaveStageTransition}
                            onCancel={handleCloseStageTransition}
                            isSubmitting={isCreatingActivity}
                        />
                    )
                }
            />

            <ActivityLogModal />
        </div >
    );
});

export default OpportunitiesCRMPage; 