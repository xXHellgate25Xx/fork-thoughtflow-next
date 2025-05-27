import { ButtonProps } from "src/components/ui/button";

// HierarchicalOption: for grouped dropdowns (e.g., Phase)
export interface HierarchicalOption {
  value: string;
  label: string;
  type?: 'select' | 'text' | 'number' | 'date';
  color?: string; // Optional, for color indicators
  options?: HierarchicalOption[]; // For groups with children
  field?: string; // Optional, for field metadata
}

// FilterDropdownProps: props for the FilterDropdown component
export interface FilterDropdownProps {
  field: string;
  label?: string;
  placeholder?: string;
  options: HierarchicalOption[];
  buttonVariant?: ButtonProps['variant'];
  currentValue?: string;
  onChange: (field: string, value: string) => void;
  onItemClick?: (itemValue: string, groupValue: string) => void;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  showColorIndicator?: boolean;
  indentChildren?: boolean;
  childrenIndentSize?: number;
  isGrouped?: boolean;
} 