import { useTheme } from '@mui/material';
import React, { ReactNode, useState } from 'react';
import { Iconify } from './iconify';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table';

// Column definition type
export interface ColumnDef<T> {
    field: string;
    headerName: string;
    width?: number;
    sortable?: boolean;
    sortDirection?: 'asc' | 'desc';
    renderCell?: (row: T) => ReactNode;
    renderHeader?: () => ReactNode;
    align?: 'left' | 'right' | 'center';
}

// Table props type
export interface DynamicTableProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
    isLoading?: boolean;
    isError?: boolean;
    error?: any;
    onRowClick?: (row: T) => void;
    getRowId?: (row: T) => string | number;
    noDataMessage?: string;
    loadingMessage?: string;
    errorMessage?: string;
    pageSize?: number;
    showRowActions?: boolean;
    onRowActionSelect?: (action: string, row: T) => void;
    rowActions?: string[];
}

export default function DynamicTable<T extends Record<string, any>>({
    columns,
    data,
    isLoading = false,
    isError = false,
    error = null,
    onRowClick,
    getRowId = (row) => row.id,
    noDataMessage = "No data found.",
    loadingMessage = "Loading data...",
    errorMessage = "Error loading data",
    pageSize = 20,
    showRowActions = false,
    onRowActionSelect,
    rowActions = ['Edit', 'Delete']
}: DynamicTableProps<T>) {
    const theme = useTheme();
    const [selectedRow, setSelectedRow] = useState<T | null>(null);

    const handleActionSelect = (action: string, row: T) => {
        if (onRowActionSelect) {
            onRowActionSelect(action, row);
        }
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-6 border border-gray-200 bg-white h-40">
                <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm text-gray-500 font-medium">{loadingMessage}</span>
                </div>
            </div>
        );
    }

    // Render error state
    if (isError) {
        return (
            <div className="flex justify-center p-6 border border-red-200 bg-white">
                <div className="flex items-center gap-2">
                    <Iconify icon="lucide:alert-circle" width={20} className="text-red-500" />
                    <span className="text-sm text-red-500 font-medium">
                        {errorMessage}: {error?.toString()}
                    </span>
                </div>
            </div>
        );
    }

    // Render empty state
    if (!data || data.length === 0) {
        return (
            <div className="flex justify-center p-6 border border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                    <Iconify icon="lucide:info" width={20} className="text-blue-500" />
                    <span className="text-sm text-gray-500 font-medium">
                        {noDataMessage}
                    </span>
                </div>
            </div>
        );
    }

    // Helper function to render cell content with appropriate styling based on field value
    const renderCellContent = (row: T, column: ColumnDef<T>) => {
        if (column.renderCell) {
            return column.renderCell(row);
        }

        const value = row[column.field];

        // Handle special field types based on field name patterns
        if (column.field.toLowerCase().includes('status') || column.field.toLowerCase().includes('stage')) {
            return (
                <div className="inline-flex items-center bg-indigo-50 text-indigo-900 px-3 py-1 rounded-md text-xs font-medium">
                    {value}
                </div>
            );
        }

        // Handle percentage values
        if (typeof value === 'string' && value.includes('%') ||
            column.field.toLowerCase().includes('probability')) {
            const numValue = typeof value === 'string'
                ? parseFloat(value.replace('%', ''))
                : typeof value === 'number' ? value : 0;

            return numValue === 0 ? "0%" : `${numValue}%`;
        }

        // Handle currency values
        if (column.field.toLowerCase().includes('price') ||
            column.field.toLowerCase().includes('value') ||
            column.field.toLowerCase().includes('cost')) {
            if (value === undefined || value === null || value === '') {
                return '-';
            }

            if (typeof value === 'number' || (typeof value === 'string' && !Number.isNaN(parseFloat(value)))) {
                const numValue = typeof value === 'number' ? value : parseFloat(value);
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2
                }).format(numValue);
            }
        }

        // Handle empty values
        if (value === undefined || value === null || value === '') {
            return '-';
        }

        // Default value display
        return value;
    };

    // Helper function to get text alignment based on the column's align property
    const getTextAlign = (align?: string) => {
        switch (align) {
            case 'right':
                return 'text-right';
            case 'center':
                return 'text-center';
            default:
                return 'text-left';
        }
    };

    return (
        <div className="border-none shadow-none">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-100">
                        <TableRow className="border-t border-b border-gray-200">
                            {columns.map((column, index) => (
                                <TableHead
                                    key={index}
                                    className={`${getTextAlign(column.align)} text-xs font-bold text-gray-700 uppercase py-3 px-4 ${index !== 0 ? 'border-l border-gray-200' : ''}`}
                                    style={column.width ? { width: `${column.width}px` } : undefined}
                                >
                                    {column.renderHeader ? (
                                        column.renderHeader()
                                    ) : (
                                        <div className="flex items-center">
                                            <span>{column.headerName}</span>
                                            {column.sortable && (
                                                <Iconify
                                                    icon={column.sortDirection === 'asc'
                                                        ? 'lucide:arrow-up'
                                                        : column.sortDirection === 'desc'
                                                            ? 'lucide:arrow-down'
                                                            : 'lucide:chevrons-up-down'}
                                                    width={14}
                                                    height={14}
                                                    className="ml-1 opacity-70"
                                                />
                                            )}
                                        </div>
                                    )}
                                </TableHead>
                            ))}
                            {showRowActions && (
                                <TableHead className="text-right text-xs font-medium text-gray-500 uppercase py-3 px-4">
                                    Actions
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data.map((row, rowIndex) => (
                            <TableRow
                                key={getRowId(row) || rowIndex}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                                className={`border-t border-gray-200 ${onRowClick ? 'cursor-pointer' : ''} ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}
                            >
                                {columns.map((column, cellIndex) => (
                                    <TableCell
                                        key={cellIndex}
                                        className={`${getTextAlign(column.align)} p-4`}
                                    >
                                        {renderCellContent(row, column)}
                                    </TableCell>
                                ))}
                                {showRowActions && (
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                                    <Iconify icon="lucide:more-horizontal" className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {rowActions.map((action, i) => (
                                                    <React.Fragment key={action}>
                                                        <DropdownMenuItem onClick={() => handleActionSelect(action, row)}>
                                                            <Iconify
                                                                icon={action.toLowerCase() === 'edit'
                                                                    ? 'lucide:pencil'
                                                                    : action.toLowerCase() === 'delete'
                                                                        ? 'lucide:trash-2'
                                                                        : 'lucide:more-horizontal'}
                                                                className="mr-2 h-4 w-4"
                                                            />
                                                            <span>{action}</span>
                                                        </DropdownMenuItem>
                                                        {i < rowActions.length - 1 && <DropdownMenuSeparator />}
                                                    </React.Fragment>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
} 