export interface KanbanRecord {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  // Sales pipeline specific fields
  lastName?: string;
  dealValue?: number;
  closeProbability?: number;
  salesperson?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  records: KanbanRecord[];
}

export interface KanbanConfig {
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

export interface SelectOption {
  value: string;
  label: string;
}

export interface KanbanField {
  id: string;
  name: string;
  type: 'text' | 'select' | 'date';
  filterable?: boolean;
  options?: SelectOption[];
}
