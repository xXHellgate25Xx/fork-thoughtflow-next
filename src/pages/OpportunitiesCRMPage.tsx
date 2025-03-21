import { useEffect, useState } from 'react';
import { useOpportunity } from 'src/hooks/useOpportunity';
import DynamicTable, { ColumnDef } from '../components/DynamicTable';
import EditDrawer, { FieldDef } from '../components/EditDrawer';
import { Iconify } from '../components/iconify';
import { Button } from '../components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import type { KanbanRecord } from '../types/kanban';

// Status label mapping
const statusLabels: Record<string, string> = {
    '01-lead': '01 - Lead',
    '04-roadmap-call': '04 - Roadmap Call',
    '05-passport-requested': '05 - Passport Requested',
    '06-agreement-sent': '06 - Agreement Sent',
    '07-agreement-signed': '07 - Agreement Signed',
    '10-disqualified': '10 - Disqualified',
    '11-sale-lost': '11 - Sale lost',
    '13-on-hold': '13 - On Hold',
};

export default function OpportunitiesCRMPage() {
    const { opportunities, isLoading, isError, error, refetch } = useOpportunity();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [sortField, setSortField] = useState<string>('Last Name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [sortedData, setSortedData] = useState<any[]>([]);
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [selectedOpportunity, setSelectedOpportunity] = useState<
        | (KanbanRecord & {
            prospectId?: string;
            email?: string;
            generalNotes?: string;
            company?: string;
            jobTitle?: string;
            phone?: string;
            sourceChannel?: string;
            spouse?: string;
        })
        | null
    >(null);

    // Sort the data when opportunities, sortField or sortDirection change
    useEffect(() => {
        if (!opportunities) return;

        const sorted = [...opportunities].sort((a, b) => {
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

        setSortedData(sorted);
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

    const handleRowClick = (opportunity: any) => {
        // Set selected opportunity
        setSelectedOpportunity(opportunity);

        // Map table columns to form fields
        const defaultValues: Record<string, any> = {
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

        // Open drawer
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        // Clear states after drawer is closed
        setTimeout(() => {
            setSelectedOpportunity(null);
            setFormValues({});
        }, 300); // Small delay to ensure drawer animation completes
    };

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
    const columns: ColumnDef<any>[] = [
        {
            field: 'Prospect ID (old)',
            headerName: 'Prospect ID (old)',
            sortable: true,
            renderHeader: () => (
                <button
                    type="button"
                    className="flex items-center hover:text-blue-700"
                    onClick={() => handleHeaderClick('Prospect ID (old)')}
                >
                    Prospect ID (old)
                    {sortField === 'Prospect ID (old)' && (
                        <Iconify
                            icon={sortDirection === 'asc' ? "mdi:arrow-up" : "mdi:arrow-down"}
                            width={16}
                            height={16}
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
                            width={16}
                            height={16}
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
                    className="flex items-center hover:text-blue-700"
                    onClick={() => handleHeaderClick('Email')}
                >
                    Email
                    {sortField === 'Email' && (
                        <Iconify
                            icon={sortDirection === 'asc' ? "mdi:arrow-up" : "mdi:arrow-down"}
                            width={16}
                            height={16}
                            className="ml-1.5"
                        />
                    )}
                </button>
            ),
        },
        {
            field: 'Current Stage (linked)',
            headerName: 'Current Stage (linked)',
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
                            width={16}
                            height={16}
                            className="ml-1.5"
                        />
                    )}
                </button>
            ),
            renderCell: (row) => (
                <span className="bg-gray-100 text-gray-700 font-normal rounded px-2 py-1 text-xs inline-block">
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
                            width={16}
                            height={16}
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
                    className="flex items-center hover:text-blue-700"
                    onClick={() => handleHeaderClick('Close Probability')}
                >
                    Close Probability
                    {sortField === 'Close Probability' && (
                        <Iconify
                            icon={sortDirection === 'asc' ? "mdi:arrow-up" : "mdi:arrow-down"}
                            width={16}
                            height={16}
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
                            width={16}
                            height={16}
                            className="ml-1.5"
                        />
                    )}
                </button>
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
                .sort(([a], [b]) => a.localeCompare(b)) // Sort by value to maintain order
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

    return (
        <div className="w-full">
            <div className="flex justify-end mb-3">
                <Button
                    variant="default"
                    className="mr-2 text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    onClick={handleAddOpportunity}
                >
                    Add opportunity
                </Button>


                <Button variant="default" className="mr-1">
                    Group
                </Button>

                <Button variant="default" className="mr-1 cursor-pointer">
                    Filter
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="default" className="cursor-pointer mr-1 flex items-center">
                            <span>Sort</span>
                            {sortField === 'Email' && (
                                <>
                                    <span className="mx-1 text-gray-400">|</span>
                                    <span className="text-blue-600">{sortField}</span>
                                    <Iconify
                                        icon={sortDirection === 'asc' ? "mdi:arrow-up" : "mdi:arrow-down"}
                                        width={14}
                                        height={14}
                                        className="ml-1 text-blue-600"
                                    />
                                </>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5} align="start" className="w-60 bg-white border border-gray-200 shadow-md p-0">
                        {columns.filter(col => col.sortable).map((column) => (
                            <DropdownMenuItem
                                key={column.field}
                                onClick={() => handleHeaderClick(column.field)}
                                className={`cursor-pointer py-2.5 px-4 hover:bg-gray-50 ${sortField === column.field ? "bg-blue-100" : ""}`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className={sortField === column.field ? "font-medium text-blue-700" : ""}>{column.headerName}</span>
                                    {sortField === column.field && (
                                        <Iconify
                                            icon={sortDirection === 'asc' ? "mdi:arrow-up" : "mdi:arrow-down"}
                                            width={16}
                                            height={16}
                                            className="text-blue-600"
                                        />
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <button type="button" className="p-2 rounded-full hover:bg-gray-100">
                    <Iconify icon="mdi:magnify" width={20} height={20} />
                </button>

                <button type="button" className="p-2 rounded-full hover:bg-gray-100">
                    <Iconify icon="mdi:dots-horizontal" width={20} height={20} />
                </button>
            </div>

            <DynamicTable
                columns={columns}
                data={sortedData.length > 0 ? sortedData : (opportunities || [])}
                isLoading={isLoading}
                isError={isError}
                error={error}
                onRowClick={handleRowClick}
                getRowId={(row) => row.id || `row-${Math.random().toString(36).substr(2, 9)}`}
                loadingMessage="Loading opportunities..."
                errorMessage="Error loading data"
                noDataMessage="No opportunities found."
            />

            <EditDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                title={selectedOpportunity ? `Edit ${formValues.lastName || 'Opportunity'}` : 'Edit Opportunity'}
                record={formValues}
                onSave={handleSave}
                onInputChange={handleInputChange}
                fields={formFields}
            />
        </div>
    );
} 