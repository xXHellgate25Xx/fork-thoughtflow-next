import type { KanbanRecord } from 'src/types/kanbanTypes';

import { MoreVertical } from 'lucide-react';

import { Card, CardContent } from '@mui/material';

import { Button } from '../button';
import { getDisplayValue } from './lib';
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '../dropdown-menu';

import type { KanbanConfig } from './types';

interface KanbanCardProps {
    item: KanbanRecord;
    index: number;
    config: KanbanConfig;
}

export function KanbanCard({ item, index, config }: KanbanCardProps) {
    const {
        displayFields = [],
        renderItem,
        onItemClick,
        onItemEdit,
        onItemDelete,
        onItemStageUpdate,
        allowEdit = true,
        allowDelete = true,
    } = config;

    // If custom render function is provided, use it
    if (renderItem) {
        return (
            <div
                className="mb-2 kanban-card"
                onClick={() => onItemClick?.(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onItemClick?.(item);
                    }
                }}
                aria-label={`Card for ${item.title}`}
            >
                {renderItem(item)}
            </div>
        );
    }

    // Default card rendering
    return (
        <div className="mb-2 kanban-card">
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-2 relative">
                    {/* Card actions menu */}
                    {(allowEdit || allowDelete) && (
                        <div className="absolute top-2 right-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {onItemStageUpdate && (
                                        <DropdownMenuItem onClick={() => onItemStageUpdate?.(item)}>
                                            Update Stage
                                        </DropdownMenuItem>
                                    )}
                                    {onItemStageUpdate && (allowEdit || allowDelete) && <DropdownMenuSeparator />}
                                    {allowEdit && (
                                        <DropdownMenuItem onClick={() => onItemEdit?.(item)}>
                                            Edit
                                        </DropdownMenuItem>
                                    )}
                                    {allowEdit && allowDelete && <DropdownMenuSeparator />}
                                    {allowDelete && (
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => onItemDelete?.(item)}
                                        >
                                            Delete
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    {/* Card content */}
                    <div
                        className="pt-2"
                        onClick={() => onItemClick?.(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                onItemClick?.(item);
                            }
                        }}
                        aria-label={`Card for ${item.title}`}
                    >
                        {displayFields.map((field, idx) => (
                            <div key={idx} className="mb-2">
                                <div className="text-sm text-gray-500">{field.label}</div>
                                <div className="font-medium">
                                    {getDisplayValue(item, field)}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 