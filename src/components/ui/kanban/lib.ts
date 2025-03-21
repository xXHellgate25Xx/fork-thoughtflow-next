import { KanbanColumn, KanbanConfig, KanbanRecord } from './types';

/**
 * Groups data items into columns based on the configuration
 */
export const groupItemsIntoColumns = (
  items: KanbanRecord[],
  config: KanbanConfig
): KanbanColumn[] => {
  const { groupByField, maxColumns = 10, columnMap } = config;
  
  // Get all distinct values for the groupByField
  const distinctValues = [...new Set(items.map((item) => item[groupByField] || 'Unknown'))];
  
  // Handle case where there are too many distinct values
  const valuesToUse = 
    distinctValues.length > maxColumns
      ? [...distinctValues.slice(0, maxColumns - 1), 'Other']
      : distinctValues;
  
  // Create columns
  const columns: KanbanColumn[] = valuesToUse.map((value) => {
    // Use custom column mapping if provided
    const customColumn = columnMap?.[value];
    
    return {
      id: customColumn?.id || `column-${value}`,
      title: customColumn?.title || String(value),
      records: [],
    };
  });
  
  // Add "Other" column if needed and not already added
  if (distinctValues.length > maxColumns && !valuesToUse.includes('Other')) {
    columns.push({
      id: 'column-other',
      title: 'Other',
      records: [],
    });
  }
  
  // Assign items to columns
  items.forEach((item) => {
    const value = item[groupByField] || 'Unknown';
    
    // Find appropriate column
    let column: KanbanColumn | undefined;
    
    if (distinctValues.length > maxColumns && !valuesToUse.includes(value)) {
      // If too many values and this value isn't in the top N, put in "Other"
      column = columns.find((col) => col.id === 'column-other');
    } else {
      // Otherwise find the matching column
      column = columns.find((col) => {
        // Compare based on value when there's no custom column mapping
        if (!columnMap?.[value]) {
          return col.id === `column-${value}`;
        }
        
        // Compare based on custom column ID when there is custom mapping
        const colValue = `column-${columnMap[value].id}`;
        return col.id === colValue;
      });
    }
    
    // Add item to the column
    if (column) {
      column.records.push(item);
    }
  });
  
  return columns;
};

/**
 * Gets a display value for a field from an item
 */
export const getDisplayValue = (
  item: KanbanRecord,
  fieldConfig: { field: string; render?: (value: any, item: KanbanRecord) => React.ReactNode }
): React.ReactNode => {
  const value = item[fieldConfig.field];
  
  if (fieldConfig.render) {
    return fieldConfig.render(value, item);
  }
  
  return value !== undefined && value !== null ? String(value) : '';
};

/**
 * Moves an item from one column to another
 */
export const moveItem = (
  columns: KanbanColumn[],
  itemId: string,
  sourceColumnId: string,
  targetColumnId: string
): KanbanColumn[] => {
  // Find source and target columns
  const sourceColumn = columns.find((col) => col.id === sourceColumnId);
  const targetColumn = columns.find((col) => col.id === targetColumnId);
  
  if (!sourceColumn || !targetColumn) {
    return columns;
  }
  
  // Find the item
  const itemIndex = sourceColumn.records.findIndex((item) => item.id === itemId);
  
  if (itemIndex === -1) {
    return columns;
  }
  
  // Remove from source
  const [item] = sourceColumn.records.splice(itemIndex, 1);
  
  // Add to target
  targetColumn.records.push(item);
  
  return [...columns];
}; 