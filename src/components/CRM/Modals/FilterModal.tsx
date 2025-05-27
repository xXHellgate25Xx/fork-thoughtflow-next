import { Button as MuiButton } from '@mui/material';
import { memo, useCallback, useEffect, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { HierarchicalOption } from 'src/types/filterDropdownTypes';

export type FilterField = {
    field: string;
    label: string;
    type: 'select' | 'text' | 'number' | 'date';
    options?: HierarchicalOption[];
};

export type FilterValue = {
    field: string;
    value: string | number;
    operator: 'eq' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte';
};

type FilterModalProps = {
    open: boolean;
    onClose: () => void;
    onApply: (filters: FilterValue[]) => void;
    fields: Record<string, FilterField>;
    currentFilters: FilterValue[];
};

const FilterModal = memo(({ open, onClose, onApply, fields, currentFilters }: FilterModalProps) => {
    const [filters, setFilters] = useState<FilterValue[]>(currentFilters);
    const [selectedField, setSelectedField] = useState<string>('');

    useEffect(() => {
        setFilters(currentFilters);
    }, [currentFilters]);

    const handleAddFilter = useCallback(() => {
        if (!selectedField) return;

        const field = fields[selectedField];
        if (!field) return;

        let initialValue: string | number;
        let initialOperator: FilterValue['operator'];

        switch (field.type) {
            case 'select':
                initialValue = field.options?.[0]?.value || '';
                initialOperator = 'eq';
                break;
            case 'number':
                initialValue = 0;
                initialOperator = 'eq';
                break;
            case 'date':
                initialValue = new Date().toISOString().split('T')[0];
                initialOperator = 'eq';
                break;
            default: // text
                initialValue = '';
                initialOperator = 'contains';
                break;
        }

        const newFilter: FilterValue = {
            field: selectedField,
            value: initialValue,
            operator: initialOperator
        };

        setFilters(prev => [...prev, newFilter]);
        setSelectedField('');
    }, [selectedField, fields]);

    const handleRemoveFilter = useCallback((index: number) => {
        setFilters(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleFilterChange = useCallback((index: number, key: keyof FilterValue, value: any) => {
        setFilters(prev => prev.map((filter, i) =>
            i === index ? { ...filter, [key]: value } : filter
        ));
    }, []);

    const handleApply = useCallback(() => {
        onApply(filters);
        onClose();
    }, [filters, onApply, onClose]);

    const handleClearAll = useCallback(() => {
        setFilters([]);
    }, []);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] w-[95vw]">
                <DialogHeader>
                    <DialogTitle>Filter Opportunities</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-2">
                        <Select value={selectedField} onValueChange={setSelectedField}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(fields).map((field) => (
                                    <SelectItem key={field.field} value={field.field}>
                                        {field.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <MuiButton
                            variant="contained"
                            onClick={handleAddFilter}
                            disabled={!selectedField}
                            className="text-xs w-full sm:w-auto"
                        >
                            Add Filter
                        </MuiButton>
                    </div>

                    <div className="space-y-2">
                        {filters.map((filter, index) => {
                            const field = fields[filter.field];
                            if (!field) return null;

                            return (
                                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 border border-gray-300 rounded relative">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFilter(index)}
                                        className="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded"
                                    >
                                        <Iconify icon="mdi:close" width={16} height={16} />
                                    </button>
                                    <div className="flex-1 flex flex-col gap-2 pr-8">
                                        <Label className="text-xs">{field.label}</Label>
                                        {field.type === 'select' ? (
                                            <Select
                                                value={String(filter.value)}
                                                onValueChange={(value) => handleFilterChange(index, 'value', value)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[200px] overflow-y-auto">
                                                    {field.options?.map((option) => (
                                                        <SelectItem key={option.value || ''} value={option.value || ''}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : field.type === 'number' ? (
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <div className="w-full sm:w-[200px]">
                                                    <Select
                                                        value={filter.operator}
                                                        onValueChange={(value) => handleFilterChange(index, 'operator', value)}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="z-[9999] max-h-[200px] overflow-y-scroll [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-gray-500 hover:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                                                            <SelectItem value="eq">Equals</SelectItem>
                                                            <SelectItem value="gt">Greater Than</SelectItem>
                                                            <SelectItem value="lt">Less Than</SelectItem>
                                                            <SelectItem value="gte">Greater Than or Equal</SelectItem>
                                                            <SelectItem value="lte">Less Than or Equal</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Input
                                                    type="number"
                                                    value={filter.value}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(index, 'value', Number(e.target.value))}
                                                    className="text-xs w-full"
                                                />
                                            </div>
                                        ) : (
                                            <Input
                                                value={filter.value}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(index, 'value', e.target.value)}
                                                className="text-xs w-full"
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2">
                        <MuiButton
                            variant="outlined"
                            onClick={handleClearAll}
                            className="text-xs w-full sm:w-auto"
                        >
                            Clear All
                        </MuiButton>
                        <MuiButton
                            variant="contained"
                            onClick={handleApply}
                            className="text-xs w-full sm:w-auto"
                        >
                            Apply Filters
                        </MuiButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
});

export default FilterModal; 