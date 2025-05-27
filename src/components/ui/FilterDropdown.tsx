import { ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { cn } from "src/libs/utils/tailwindUtils";
import type { FilterDropdownProps, HierarchicalOption } from "../../types/filterDropdownTypes";
import { Button } from "./button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./dropdown-menu";

const findSelectedOption = (
    options: HierarchicalOption[],
    value: string | undefined,
): HierarchicalOption | undefined => {
    if (value === null || value === undefined) return undefined;
    return options.reduce<HierarchicalOption | undefined>((found, option) => {
        if (found) return found;
        if (option.value === value) return option;
        if (option.options) return findSelectedOption(option.options, value) || found;
        return found;
    }, undefined);
};

export function FilterDropdown({
    field,
    placeholder = "Select...",
    options,
    currentValue,
    onChange,
    buttonClassName,
    buttonVariant = "outline",
    dropdownClassName,
    showColorIndicator = true,
    indentChildren = true,
    childrenIndentSize = 20,
    isGrouped = false,
}: FilterDropdownProps) {
    const selectedOption = useMemo(() => findSelectedOption(options, currentValue), [options, currentValue]);

    // Handle item click (now just calls onChange with field and currentValue)
    const handleItemClick = (itemValue: string, itemField: string, groupValue: string) => {
        onChange(itemField, itemValue);
    };

    // Get display text for the button
    const getDisplayText = () => {
        if (selectedOption) {
            return selectedOption.label;
        }
        return placeholder;
    };

    // Render a group option and its children
    const renderGroup = (group: HierarchicalOption, hasSeparator = false) => {
        const isSelected = currentValue === group.value;
        return (
            <div key={group.value}>
                {hasSeparator && <DropdownMenuSeparator />}
                <DropdownMenuItem
                    className={cn("flex items-center cursor-pointer font-medium", isSelected && "bg-primary/10 rounded-none")}
                    onClick={() => onChange(group.field || field, group.value)}
                >
                    <span>{group.label}</span>
                </DropdownMenuItem>
                {group.options && group.options.length > 0 && (
                    <>
                        {group.options.map((child: HierarchicalOption) => {
                            const isChildSelected = currentValue === child.value;
                            return (
                                <DropdownMenuItem
                                    key={child.value}
                                    className={cn("flex items-center cursor-pointer", isChildSelected && "bg-primary/10 rounded-none")}
                                    style={indentChildren ? { paddingLeft: childrenIndentSize } : undefined}
                                    onClick={() => handleItemClick(child.value, child.field || field, group.value)}
                                >
                                    {showColorIndicator && group.color && (
                                        <div className={`w-1 h-5 mr-2 bg-${group.color}`} />
                                    )}
                                    <span className="text-sm">{child.label}</span>
                                </DropdownMenuItem>
                            );
                        })}
                    </>
                )}
            </div>
        );
    };

    // Render a flat option (no group)
    const renderFlatOption = (option: HierarchicalOption) => {
        const isSelected = currentValue === option.value;
        return (
            <DropdownMenuItem
                key={option.value}
                className={cn("flex items-center cursor-pointer", isSelected && "bg-primary/10 rounded-none")}
                onClick={() => onChange(option.field || field, option.value)}
            >
                {showColorIndicator && option.color && (
                    <div className="w-2 h-full mr-2" style={{ backgroundColor: option.color }} />
                )}
                <span className="text-sm">{option.label}</span>
            </DropdownMenuItem>
        );
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={buttonVariant} className={cn("justify-between max-w-[200px] gap-1 text-xs focus:ring-0 focus:outline-none", buttonClassName)}>
                        <span className="truncate overflow-hidden whitespace-nowrap flex-1 text-left">{getDisplayText()}</span>
                        <ChevronDown className="h-3 w-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={cn(" max-h-[400px] overflow-y-auto z-2000", dropdownClassName)}>
                    <DropdownMenuGroup>
                        {isGrouped
                            ? options.map((option: HierarchicalOption, index: number) => renderGroup(option, index > 0 && !option.options))
                            : options.map((option: HierarchicalOption) => renderFlatOption(option))}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
} 