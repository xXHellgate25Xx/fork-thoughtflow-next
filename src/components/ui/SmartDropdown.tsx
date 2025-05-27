import * as React from "react";

// TEMPORARY: Combobox test for debugging popover
import { Combobox, ComboboxOption } from "./combobox";

// Option types
export interface SmartDropdownOption {
    value: string;
    label: string;
    color?: string;
    field?: string;
}
export interface SmartDropdownGroup {
    label: string;
    value: string;
    options: SmartDropdownOption[];
    color?: string;
    field?: string;
}

export type SmartDropdownOptions = SmartDropdownOption[] | SmartDropdownGroup[];

interface SmartDropdownProps {
    options: SmartDropdownOptions;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    width?: string | number;
    searchable?: boolean;
    showColorIndicator?: boolean;
    grouped?: boolean;
    indentChildren?: boolean;
    childrenIndentSize?: number;
    buttonVariant?: "outline" | "default" | "link" | "destructive" | "secondary" | "ghost" | "naked" | "unstyled";
    disabled?: boolean;
}

function isGrouped(options: SmartDropdownOptions): options is SmartDropdownGroup[] {
    return Array.isArray(options) && options.length > 0 && 'options' in options[0];
}

export function SmartDropdown({
    options,
    value,
    onChange,
    placeholder = "Select...",
    className,
    width = 200,
    searchable = false,
    showColorIndicator = true,
    grouped = false,
    indentChildren = true,
    childrenIndentSize = 20,
    buttonVariant = "outline",
    disabled = false,
}: SmartDropdownProps) {
    // If not explicitly grouped, auto-detect
    const isGroup = grouped || isGrouped(options);
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    // Find selected option
    const findSelected = (opts: SmartDropdownOptions, val: string): SmartDropdownOption | undefined => {
        if (isGroup) {
            const found = (opts as SmartDropdownGroup[]).find(group => group.options.some(o => o.value === val))?.options.find(o => o.value === val);
            if (found) return found;

            return undefined;
        }
        return (opts as SmartDropdownOption[]).find((o) => o.value === val);
    };
    const selected = findSelected(options, value);

    // For large lists or if searchable, use popover/command
    const useCommand = searchable || (!isGroup && (options as SmartDropdownOption[]).length > 30);

    return (
        <SmartDropdownComboboxTest options={options} value={value} onChange={onChange} />
    )
}

// TEMPORARY: Combobox test for debugging popover
export function SmartDropdownComboboxTest({ options, value, onChange }: {
    options: SmartDropdownOption[] | SmartDropdownGroup[];
    value: string;
    onChange: (value: string) => void;
}) {
    // Flatten options if grouped
    const flatOptions = Array.isArray(options) && options.length > 0 && 'options' in options[0]
        ? (options as SmartDropdownGroup[]).flatMap((g) => g.options.map((o) => ({ value: o.value, label: o.label, field: o.field })))
        : (options as SmartDropdownOption[]).map((o) => ({ value: o.value, label: o.label, field: o.field })) as ComboboxOption[];
    return (
        <Combobox
            options={flatOptions}
            value={value}
            onChange={onChange}
            placeholder="Test Combobox"
            className="mt-4"
            width={220}
        />
    );
} 