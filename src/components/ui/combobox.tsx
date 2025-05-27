import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { cn } from "../../libs/utils/tailwindUtils";
import { Button } from "./button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Popover, PopoverContent, PopoverTrigger, } from "./popover";

export interface ComboboxOption {
    value: string;
    label: string;
    field?: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    width?: string | number;
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = "Search...",
    className,
    disabled = false,
    width = 200,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [triggerWidth, setTriggerWidth] = React.useState<number | string>(width);

    React.useEffect(() => {
        if (buttonRef.current) {
            setTriggerWidth(buttonRef.current.offsetWidth);
        }
    }, [open, width]);

    const selected = options.find((o) => o.value === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={buttonRef}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(`justify-between pl-[14px] py-4 pr-3 h-auto font-normal text-base ${!value && 'text-gray-500'}`, className)}
                    style={{ width }}
                    disabled={disabled}
                >
                    <p className="truncate my-0">{selected ? selected.label : placeholder}</p>

                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 z-[4000]" style={{ width: triggerWidth }}>
                <Command loop filter={(_, search, keywords) => {
                    const extendValue = (keywords || []).join(' ').toLowerCase()
                    if (extendValue.includes(search.toLowerCase())) return 1
                    return 0
                }}>
                    <CommandInput placeholder={placeholder} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    keywords={[option.label]}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
} 