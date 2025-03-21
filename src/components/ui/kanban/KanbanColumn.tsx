import { Plus } from 'lucide-react';
import { Droppable } from 'react-beautiful-dnd';

import { KanbanColumn as KanbanColumnType } from 'src/types/kanbanTypes';
import { Button } from '../button';
import { KanbanCard } from './KanbanCard';
import { KanbanConfig } from './types';

interface KanbanColumnProps {
    column: KanbanColumnType;
    config: KanbanConfig;
}

export function KanbanColumn({ column, config }: KanbanColumnProps) {
    const {
        renderColumnHeader,
        allowCreate = true,
        onItemCreate
    } = config;

    // If custom render function is provided for column header, use it
    const columnHeader = renderColumnHeader ? (
        renderColumnHeader(column)
    ) : (
        <div className="p-2 flex justify-between items-center border-b border-divider">
            <div>
                <h3 className="text-base font-bold">
                    {column.title}
                </h3>
                <p className="text-xs text-gray-500">
                    {column.records.length} items
                </p>
            </div>

            {allowCreate && onItemCreate && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onItemCreate(column.id)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            )}
        </div>
    );

    return (
        <div
            className="w-[300px] flex-shrink-0 flex flex-col max-h-full mx-1 bg-background rounded kanban-column shadow-none"
        >
            {/* Column Header */}
            {columnHeader}

            {/* Column Content - Droppable Area */}
            <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex-1 overflow-y-auto p-2 transition-colors duration-200 bg-transparent"
                    >
                        {column.records.map((item, index) => (
                            <KanbanCard
                                key={item.id}
                                item={item}
                                index={index}
                                config={config}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
} 