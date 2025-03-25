import { useState } from 'react';

import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { KanbanColumn, KanbanRecord } from 'src/types/kanbanTypes';

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onRecordUpdate: (record: KanbanRecord) => void;
  onRecordDelete: (recordId: string) => void;
  renderCustomCard?: (record: KanbanRecord) => React.ReactNode;
  renderColumnHeader?: (column: KanbanColumn) => React.ReactNode;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  onRecordUpdate,
  onRecordDelete,
  renderCustomCard,
  renderColumnHeader,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRecord, setSelectedRecord] = useState<KanbanRecord | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, record: KanbanRecord) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecord(record);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRecord(null);
  };

  const handleDelete = () => {
    if (selectedRecord) {
      onRecordDelete(selectedRecord.id);
      handleMenuClose();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  // Default card renderer
  const defaultCardRenderer = (record: KanbanRecord) => (
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle1">{record.title}</Typography>
        <IconButton size="small" onClick={(e) => handleMenuClick(e, record)}>
          <Iconify icon="mdi:dots-vertical" />
        </IconButton>
      </Box>

      {record.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {record.description}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {record.priority && (
          <Chip label={record.priority} size="small" color={getPriorityColor(record.priority)} />
        )}
        {record.assignee && (
          <Typography variant="caption" color="text.secondary">
            {record.assignee}
          </Typography>
        )}
      </Box>
    </CardContent>
  );

  // Default column header renderer
  const defaultColumnHeaderRenderer = (column: KanbanColumn) => (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="h6">{column.title}</Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, height: '100%', overflowX: 'auto' }}>
      {columns.map((column) => (
        <Paper
          key={column.id}
          sx={{
            width: 300,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '100%',
          }}
          className="kanban-column"
        >
          {renderColumnHeader ? renderColumnHeader(column) : defaultColumnHeaderRenderer(column)}

          <Box
            sx={{ flex: 1, overflowY: 'auto', p: 2 }}
            className="kanban-column-content"
          >
            {column.records.map((record: KanbanRecord, index: number) => (
              <Card
                key={record.id}
                sx={{ mb: 2 }}
                className="kanban-card"
              >
                {renderCustomCard ? (
                  <Box sx={{ position: 'relative' }}>
                    {renderCustomCard(record)}
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, record)}
                      sx={{ position: 'absolute', top: 4, right: 4 }}
                    >
                      <Iconify icon="mdi:dots-vertical" />
                    </IconButton>
                  </Box>
                ) : (
                  defaultCardRenderer(record)
                )}
              </Card>
            ))}
          </Box>
        </Paper>
      ))}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleDelete}>
          <Iconify icon="mdi:trash-outline" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};
