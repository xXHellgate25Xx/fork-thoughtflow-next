import type { ReactNode } from 'react';

import React, { useCallback } from 'react';


import { Iconify } from '../../iconify';
import { Button } from '../../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../ui/dropdown-menu';


// Column definition type
export interface ColumnDef<T> {
    field: string;
    headerName: string;
    width?: number;
    sortable?: boolean;
    sortDirection?: 'asc' | 'desc';
    renderCell?: (row: T) => ReactNode;
    renderHeader?: () => ReactNode;
    onHeaderClick?: () => void;
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
    bottomComponent?: ReactNode;
    errorMessage?: string;
    showRowActions?: boolean;
    onRowActionSelect?: (action: string, row: T) => void;
    rowActions?: string[];
    onSort?: (field: string, direction: 'asc' | 'desc') => void;
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
    errorMessage = "Error loading data",
    showRowActions = false,
    onRowActionSelect,
    rowActions = ['Edit', 'Delete'],
    bottomComponent = null,
    onSort
}: DynamicTableProps<T>) {

    const handleActionSelect = useCallback((action: string, row: T) => {
        if (onRowActionSelect) {
            onRowActionSelect(action, row);
        }
    }, [onRowActionSelect]);

    // Helper function to get text alignment based on the column's align property
    const getTextAlign = useCallback((align?: string) => {
        switch (align) {
            case 'right':
                return 'text-right';
            case 'center':
                return 'text-center';
            default:
                return 'text-left';
        }
    }, []);

    // Helper function to render cell content with appropriate styling based on field value
    const renderCellContent = useCallback((row: T, column: ColumnDef<T>) => {
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
    }, []);


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

    return (
        <div className="w-full h-full border border-gray-200 rounded-md overflow-auto relative">
            <table className="w-full border-collapse table-fixed">
                <thead className="sticky top-0 z-10">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={`${getTextAlign(column.align)} bg-gray-100 text-xs font-bold text-gray-700 capitalize py-3 px-4 border-b border-r border-gray-200 truncate relative group hover:bg-gray-200 transition-colors duration-150 ${column.sortable ? 'cursor-pointer' : ''}`}
                                style={{
                                    width: `var(--col-${index}-width, ${column.width || 100}px)`,
                                    maxWidth: `var(--col-${index}-width, ${column.width || 200}px)`,
                                }}
                                onClick={() => {
                                    if (column.onHeaderClick) {
                                        column.onHeaderClick();
                                    }
                                }}
                            >
                                {column.renderHeader ? (
                                    column.renderHeader()
                                ) : (
                                    <div className="flex items-center overflow-hidden whitespace-nowrap">
                                        <span className="truncate">{column.headerName}</span>
                                        {column.sortable && column.sortDirection && (
                                            <Iconify
                                                icon={column.sortDirection === 'asc'
                                                    ? 'lucide:arrow-up'
                                                    : 'lucide:arrow-down'}
                                                width={14}
                                                height={14}
                                                className="ml-1 text-blue-600 flex-shrink-0"
                                            />
                                        )}
                                    </div>
                                )}
                            </th>
                        ))}
                        {showRowActions && (
                            <th className="text-right bg-gray-100 text-[10px] font-medium text-gray-500 uppercase py-3 px-2 border-b border-gray-200 w-[80px]">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={getRowId(row) || rowIndex}
                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                            className={`${onRowClick ? 'cursor-pointer' : ''} ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}
                        >
                            {columns.map((column, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className={`${getTextAlign(column.align)} py-3 px-2 border-b border-r border-gray-200 overflow-hidden`}
                                    style={{
                                        width: `var(--col-${cellIndex}-width, ${column.width || 150}px)`,
                                        maxWidth: `var(--col-${cellIndex}-width, ${column.width || 150}px)`,
                                    }}
                                >
                                    {renderCellContent(row, column)}
                                </td>
                            ))}
                            {showRowActions && (
                                <td className="text-right py-3 px-2 border-b border-gray-200 w-[80px]">
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
                                </td>
                            )}
                        </tr>
                    ))}

                    {data.length === 0 && !isLoading && (
                        <tr>
                            <td colSpan={columns.length + (showRowActions ? 1 : 0)} className="py-12">
                                <div className="flex flex-col items-center justify-center text-center px-4">
                                    <Iconify
                                        icon="lucide:inbox"
                                        width={48}
                                        className="text-gray-400 mb-4"
                                    />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {noDataMessage}
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-sm">
                                        {`Try adjusting your filters or search criteria to find what you're looking for.`}
                                    </p>
                                </div>
                            </td>
                        </tr>
                    )}
                    {bottomComponent}
                </tbody>
            </table>
        </div>
    );
} 