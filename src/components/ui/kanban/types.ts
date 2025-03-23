// Re-export from the central types file
import type {
  KanbanProps,
  KanbanColumn,
  KanbanRecord,
  KanbanBaseConfig,
  KanbanDynamicConfig as KanbanConfig
} from "src/types/kanbanTypes";

// Export types for component users
export type { KanbanProps, KanbanColumn, KanbanConfig, KanbanRecord, KanbanBaseConfig };
