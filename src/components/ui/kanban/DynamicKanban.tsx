import * as Progress from '@radix-ui/react-progress';
import { AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

import { KanbanColumn as KanbanColumnType, KanbanProps } from 'src/types/kanbanTypes';
import { KanbanColumn } from './KanbanColumn';
import { groupItemsIntoColumns, moveItem } from './lib';

export function DynamicKanban({
    items,
    config,
    isLoading = false,
    isError = false,
    error = null,
}: KanbanProps) {
    const [columns, setColumns] = useState<KanbanColumnType[]>([]);

    // Memoize the callback to avoid it being recreated on every render
    const notifyColumnsCreated = useCallback((generatedColumns: KanbanColumnType[]) => {
        if (config.onColumnsCreated) {
            config.onColumnsCreated(generatedColumns);
        }
    }, [config.onColumnsCreated]);

    // Create columns from items whenever items or necessary config changes
    useEffect(() => {
        if (items && items.length > 0) {
            console.log('items', items);
            console.log('config', config);
            const generatedColumns = groupItemsIntoColumns(items, {
                groupByField: config.groupByField,
                maxColumns: config.maxColumns,
                columnMap: config.columnMap
            });

            setColumns(generatedColumns);
            notifyColumnsCreated(generatedColumns);
        } else {
            setColumns([]);
        }
    }, [
        items,
        config.groupByField,
        config.maxColumns,
        // Use JSON.stringify for object comparisons to prevent unnecessary rerenders
        // Only trigger if the actual mapping changes
        JSON.stringify(config.columnMap),
        notifyColumnsCreated
    ]);

    // Handle the drag end event
    const handleDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        // Dropped outside the list or no change
        if (!destination ||
            (source.droppableId === destination.droppableId &&
                source.index === destination.index)) {
            return;
        }

        // Find the item that was moved
        const sourceColumn = columns.find(col => col.id === source.droppableId);
        const item = sourceColumn?.records.find(e => e.id === draggableId);

        if (!item) return;

        // Update columns state
        const updatedColumns = moveItem(
            columns,
            draggableId,
            source.droppableId,
            destination.droppableId
        );

        setColumns(updatedColumns);

        // Call the callback if provided
        if (config.onItemMove) {
            // Update the item's status to match the target column
            const updatedItem = {
                ...item,
                [config.groupByField]: destination.droppableId.replace('column-', '')
            };

            config.onItemMove(
                updatedItem,
                source.droppableId,
                destination.droppableId
            );
        }
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className="flex justify-center p-5 items-center flex-col">
                <Progress.Root
                    className="relative overflow-hidden bg-gray-200 rounded-full w-40 h-6"
                    style={{ transform: 'translateZ(0)' }}
                    value={65}
                >
                    <Progress.Indicator
                        className="bg-blue-500 w-full h-full transition-transform duration-500 ease-in-out"
                        style={{ transform: 'translateX(-35%)' }}
                    />
                </Progress.Root>
                <span className="mt-2 text-gray-600">Loading...</span>
            </div>
        );
    }

    // Render error state
    if (isError) {
        return (
            <div className="flex justify-center p-5 items-center" style={{ color: 'var(--mui-palette-error-main)' }}>
                <AlertCircle size={20} className="mr-2" />
                <span className="text-red-500">
                    Error loading data: {error?.message || 'Unknown error'}
                </span>
            </div>
        );
    }

    // Render empty state
    if (!items || items.length === 0) {
        return (
            <div className="flex justify-center p-5">
                <span className="text-gray-500">No items to display</span>
            </div>
        );
    }

    // Render the kanban board
    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex p-1" style={{ height: 'calc(100vh - 200px)', overflowX: 'auto' }}>
                {columns.map(column => (
                    <KanbanColumn
                        key={column.id}
                        column={column}
                        config={config}
                    />
                ))}
            </div>
        </DragDropContext>
    );
} 