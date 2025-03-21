// Common types for Kanban functionality across the application

// Basic record type with only essential fields
export interface KanbanRecord {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Allow additional dynamic properties
  [key: string]: any;
}

// Strongly typed fields for various use cases
export interface KanbanStandardFields {
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
}

export interface KanbanSalesFields {
  lastName?: string;
  dealValue?: number;
  closeProbability?: number;
  salesperson?: string;
}

export interface KanbanCRMFields {
  email?: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  generalNotes?: string;
}

// A complete record would be KanbanRecord & KanbanStandardFields & (optionally) other field types

// Column structure
export interface KanbanColumn {
  id: string;
  title: string;
  records: KanbanRecord[];
  items?: KanbanRecord[]; // For backward compatibility
}

// Basic configuration interface shared by all implementations
export interface KanbanBaseConfig {
  allowCreate?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowDrag?: boolean;
}

// Legacy config type
export interface KanbanLegacyConfig extends KanbanBaseConfig {
  columns: KanbanColumn[];
  filters?: {
    field: string;
    value: string;
  }[];
  defaultSortBy?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  defaultView?: 'table' | 'kanban';
}

// Dynamic config type
export interface KanbanDynamicConfig extends KanbanBaseConfig {
  // The field used to group items into columns
  groupByField: string;
  
  // Maximum number of distinct column values to display
  // If exceeded, additional values will be grouped into an "Other" column
  maxColumns?: number;
  
  // Custom column mapping to override default column creation
  // Maps field values to custom column IDs and titles
  columnMap?: Record<string, { id: string; title: string }>;
  
  // Custom render function for items
  renderItem?: (item: KanbanRecord) => React.ReactNode;
  
  // Custom render function for column headers
  renderColumnHeader?: (column: KanbanColumn) => React.ReactNode;
  
  // Callback when an item is moved between columns
  onItemMove?: (item: KanbanRecord, sourceColumn: string, targetColumn: string) => void;
  
  // Callback when an item is clicked
  onItemClick?: (item: KanbanRecord) => void;
  
  // Callback when an item is edited
  onItemEdit?: (item: KanbanRecord) => void;
  
  // Callback when an item is deleted
  onItemDelete?: (item: KanbanRecord) => void;
  
  // Callback when an item's stage needs to be updated
  onItemStageUpdate?: (item: KanbanRecord) => void;
  
  // Callback when a new item is created
  onItemCreate?: (columnId: string) => void;
  
  // Callback when columns are created/updated
  onColumnsCreated?: (columns: KanbanColumn[]) => void;
  
  // Fields to display in each card
  displayFields?: Array<{
    field: string;
    label: string;
    render?: (value: any, item: KanbanRecord) => React.ReactNode;
  }>;
}

// Field definition
export interface KanbanField {
  id: string;
  name: string;
  type: 'text' | 'select' | 'date';
  filterable?: boolean;
  options?: SelectOption[];
}

// For select fields
export interface SelectOption {
  value: string;
  label: string;
}

// Props for the Kanban component
export interface KanbanProps {
  // Data items to display on the board
  items: KanbanRecord[];
  
  // Configuration for the board
  config: KanbanDynamicConfig;
  
  // Loading state
  isLoading?: boolean;
  
  // Error state
  isError?: boolean;
  
  // Error message
  error?: any;
} 