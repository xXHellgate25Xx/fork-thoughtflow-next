import type { ReactNode } from 'react';

import React, { useCallback } from 'react';


import type { SortCondition } from 'src/types/airtableTypes';
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
    minWidth?: number;
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
    bottomComponent?: ReactNode;
    errorMessage?: string;
    showRowActions?: boolean;
    onRowActionSelect?: (action: string, row: T) => void;
    rowActions?: string[];
    onSort?: (field: string, direction: 'asc' | 'desc') => void;
    sortCondition?: SortCondition;
    selectedRowId?: string | number;
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
    onSort,
    sortCondition,
    selectedRowId
}: DynamicTableProps<T>) {

    const handleActionSelect = useCallback((action: string, row: T) => {
        if (onRowActionSelect) {
            onRowActionSelect(action, row);
        }
    }, [onRowActionSelect]);

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


    const renderHeaderClick = useCallback((column: ColumnDef<T>): void => {
        if (!column.sortable || !onSort) return;
        let newDirection: 'asc' | 'desc' = 'asc';
        if (sortCondition && sortCondition.field === column.field) {
            newDirection = sortCondition.direction === 'asc' ? 'desc' : 'asc';
        }
        onSort(column.field, newDirection);
    }, [onSort, sortCondition]);


    // Render error state
    if (isError) {
        return (
            <div className="flex justify-center p-6 border border-red-200 bg-white">
                <div className="flex items-center gap-2">
                    <Iconify icon="lucide:alert-circle" width={20} className="text-red-500" />
                    <span className="text-xs text-red-500 font-medium">
                        {errorMessage}: {error?.toString()}
                    </span>
                </div>
            </div>
        );
    }
    return (
        <div className="w-full h-full overflow-auto relative text-xs">
            <table className="w-full border-collapse table-fixed">
                <thead className="sticky top-0 z-10">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={`text-left bg-white text-xs font-semibold text-gray-700 pt-5 pb-3 px-4 truncate relative group transition-colors duration-150 border-b border-gray-200 ${column.sortable ? 'cursor-pointer' : ''}`}
                                style={{
                                    width: `var(--col-${index}-width, ${column.width || 100}px)`,
                                    maxWidth: `var(--col-${index}-width, ${column.width || 200}px)`,
                                    padding: `var(--col-${index}-padding, 20px 16px 12px 16px)`,
                                }}
                                onClick={() => renderHeaderClick(column)}
                            >
                                {column.renderHeader ? (
                                    column.renderHeader()
                                ) : (
                                    <div className="flex items-center overflow-hidden whitespace-nowrap">
                                        <span className="truncate">{column.headerName}</span>
                                        {column.sortable && (
                                            <span className="ml-1">
                                                {sortCondition && sortCondition.field === column.field ? (
                                                    <Iconify
                                                        icon={sortCondition.direction === 'asc'
                                                            ? 'lucide:arrow-up'
                                                            : 'lucide:arrow-down'}
                                                        width={12}
                                                        height={12}
                                                        className="text-blue-600 flex-shrink-0"
                                                    />
                                                ) : (
                                                    <Iconify
                                                        icon="lucide:chevron-down"
                                                        width={12}
                                                        height={12}
                                                        className="text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100"
                                                    />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </th>
                        ))}
                        {showRowActions && (
                            <th className="text-left bg-white text-xs font-semibold text-gray-700 pt-5 pb-3 px-4 w-[80px] border-b border-gray-200">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 && !isLoading && !isError ? (
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
                    ) : (
                        data.map((row, rowIndex) => {
                            const rowId = getRowId(row);
                            const isSelected = selectedRowId && rowId === selectedRowId;

                            return (
                                <tr
                                    key={rowId || rowIndex}
                                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                                    className={`
                                        ${onRowClick ? 'cursor-pointer' : ''} 
                                        ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                                        hover:bg-blue-50 transition-colors duration-150
                                        ${isSelected ? 'ring-2 ring-blue-500 relative z-10' : ''}
                                    `}
                                >
                                    {columns.map((column, cellIndex) => (
                                        <td
                                            key={cellIndex}
                                            className="text-left py-3 px-4 overflow-hidden text-xs"
                                        >
                                            {renderCellContent(row, column)}
                                        </td>
                                    ))}
                                    {showRowActions && (
                                        <td className="text-left py-3 px-4 w-[80px]">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 p-0">
                                                        <Iconify icon="lucide:more-horizontal" className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="text-xs">
                                                    {rowActions.map((action, i) => (
                                                        <React.Fragment key={action}>
                                                            <DropdownMenuItem onClick={() => handleActionSelect(action, row)}>
                                                                <Iconify
                                                                    icon={action.toLowerCase() === 'edit'
                                                                        ? 'lucide:pencil'
                                                                        : action.toLowerCase() === 'delete'
                                                                            ? 'lucide:trash-2'
                                                                            : 'lucide:more-horizontal'}
                                                                    className="mr-2 h-3.5 w-3.5"
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
                            );
                        })
                    )}
                    {bottomComponent}
                </tbody>
            </table>
        </div>
    );
} 