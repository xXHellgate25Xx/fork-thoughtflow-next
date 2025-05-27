import { Button as MuiButton } from '@mui/material';
import { memo } from 'react';
import { Iconify } from 'src/components/iconify';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import { FilterDropdown } from 'src/components/ui/FilterDropdown';
import type { FilterCondition } from 'src/types/airtableTypes';
import type { HierarchicalOption } from 'src/types/filterDropdownTypes';
import type { OpportunitiesRecord } from 'src/types/mapAirtableTypes';
import { FilterField } from '../Modals/FilterModal';
import type { ColumnDef } from '../Views/DynamicTable';

interface OpportunitiesToolbarProps {
    isAdmin: boolean;
    filters: {
        phase: FilterField;
        owner: FilterField;
    }
    currentFilter: {
        phase: FilterCondition | null;
        stage: FilterCondition | null;
        owner: FilterCondition | null;
    }
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    columnsConfig: ColumnDef<Partial<OpportunitiesRecord>>[];
    onToolbarFilterChange: (field: string, value: string) => void;
    onHeaderClick: (field: string) => void;
    onAddOpportunity: () => void;
    onFilterClick: () => void;
}

export const OpportunitiesToolbar = memo(({
    isAdmin,
    filters,
    currentFilter,
    sortField,
    sortDirection,
    columnsConfig,
    onToolbarFilterChange,
    onHeaderClick,
    onAddOpportunity,
    onFilterClick,
}: OpportunitiesToolbarProps) => {
    const phaseOptions: HierarchicalOption[] = filters.phase.options as HierarchicalOption[];
    const ownerOptions: HierarchicalOption[] = filters.owner?.options as HierarchicalOption[];
    const currentPhaseFilter = currentFilter.phase;
    const currentStageFilter = currentFilter.stage;
    const currentOwnerFilter = currentFilter.owner;
    return (
        <div className="flex justify-between pb-0">
            <div className="flex items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <MuiButton className="cursor-pointer mr-1 flex items-center text-xs px-2 py-0.5">
                            <span>View: List</span>
                            <Iconify
                                icon="mdi:chevron-down"
                                width={14}
                                height={14}
                                className="ml-1"
                            />
                        </MuiButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5} align="start" className="w-40 bg-white border border-gray-200 shadow-md p-0">
                        <DropdownMenuItem className="cursor-pointer py-1.5 px-2 text-xs hover:bg-gray-50 bg-blue-100">
                            <div className="flex items-center w-full">
                                <Iconify
                                    icon="mdi:view-list"
                                    width={14}
                                    height={14}
                                    className="mr-2"
                                />
                                <span className="font-medium text-blue-700">List</span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center gap-2 ml-2 pb-1">
                    <FilterDropdown
                        field="Phase (from Stage)"
                        label="Phase"
                        placeholder="All Phases"
                        options={phaseOptions}
                        currentValue={currentStageFilter?.value
                            ? currentStageFilter.value
                            : currentPhaseFilter?.value === ''
                                ? 'unassigned'
                                : currentPhaseFilter?.value
                                    ? currentPhaseFilter.value
                                    : 'all'}
                        onChange={(field, value) => onToolbarFilterChange(field, value)}
                        showColorIndicator
                        isGrouped
                    />

                    {isAdmin ? (
                        <FilterDropdown
                            field="Owner"
                            label="Owner"
                            placeholder="All Owners"
                            options={ownerOptions}
                            currentValue={currentOwnerFilter?.value === '' ? 'unassigned' : (currentOwnerFilter?.value ? currentOwnerFilter.value : 'all')}
                            onChange={(field, value) => onToolbarFilterChange(field, value)}
                            isGrouped={false}
                        />
                    ) : (
                        <div className="flex items-center bg-blue-50 border border-blue-200 rounded-md text-blue-700 p-1 ml-1 w-[300px]">
                            <Iconify
                                icon="mdi:information-outline"
                                width={14}
                                height={14}
                                className="mr-1"
                            />
                            <span className="text-xs whitespace-nowrap">You are viewing your assigned opportunities only.</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex">
                <MuiButton
                    className="mr-1.5 text-white bg-blue-600 hover:bg-blue-700 cursor-pointer text-xs px-2 py-0.5"
                    onClick={onAddOpportunity}
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
                                onClick={() => onHeaderClick(column.field)}
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

                {isAdmin && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button type="button" className="p-1 rounded-full hover:bg-gray-100">
                                <Iconify icon="mdi:dots-horizontal" width={16} height={16} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent sideOffset={5} align="end" className="w-48 bg-white border border-gray-200 shadow-md p-0">
                            <DropdownMenuItem
                                onClick={onFilterClick}
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
                )}
            </div>
        </div>
    );
});

export default OpportunitiesToolbar; 