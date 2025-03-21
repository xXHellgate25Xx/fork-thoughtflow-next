import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import { KanbanColumn, KanbanRecord } from 'src/types/kanbanTypes';
import { Iconify } from '../components/iconify';
import { KanbanBoard } from '../components/kanban/KanbanBoard';


// Mock data for Sales Pipeline
const mockSalesPipelineData: KanbanRecord[] = [
  {
    id: '231',
    title: 'Doris',
    lastName: 'Imoekor',
    status: '01-lead',
    createdAt: '2023-11-01',
    updatedAt: '2023-11-01',
  },
  {
    id: '232',
    title: 'Adedayo Tayo',
    lastName: 'Anthony',
    status: '01-lead',
    createdAt: '2023-11-02',
    updatedAt: '2023-11-05',
  },
  {
    id: '235',
    title: 'Ekhoe',
    lastName: 'Ame-ogie',
    status: '01-lead',
    createdAt: '2023-11-03',
    updatedAt: '2023-11-06',
  },
  {
    id: '229',
    title: 'Nnenna',
    lastName: 'Okoli',
    status: '01-lead',
    createdAt: '2023-11-04',
    updatedAt: '2023-11-07',
  },
  {
    id: '2',
    title: 'Agbenu',
    lastName: 'Ojobo',
    status: '04-roadmap-call',
    dealValue: 39900,
    closeProbability: 90,
    salesperson: 'Tyrone Siren',
    createdAt: '2023-11-05',
    updatedAt: '2023-11-08',
  },
  {
    id: '1',
    title: 'Adenusi Akeem',
    lastName: 'Opeyemi',
    status: '04-roadmap-call',
    dealValue: 33000,
    closeProbability: 85,
    salesperson: 'Tyrone Siren',
    createdAt: '2023-11-06',
    updatedAt: '2023-11-09',
  },
  {
    id: '61',
    title: 'Adebiyi',
    lastName: 'Oluwafemi',
    status: '05-passport-requested',
    dealValue: 39900,
    closeProbability: 40,
    salesperson: 'Tyrone Siren',
    createdAt: '2023-11-07',
    updatedAt: '2023-11-10',
  },
  {
    id: '62',
    title: 'Ajayi',
    lastName: 'Ayokunle',
    status: '05-passport-requested',
    dealValue: 39900,
    closeProbability: 45,
    salesperson: 'Tyrone Siren',
    createdAt: '2023-11-08',
    updatedAt: '2023-11-11',
  },
  {
    id: '83',
    title: 'Uwota Immaculate',
    lastName: 'Chinasia',
    status: '06-agreement-sent',
    dealValue: 39900,
    closeProbability: 30,
    salesperson: 'Chris McDougall',
    createdAt: '2023-11-09',
    updatedAt: '2023-11-12',
  },
  {
    id: '85',
    title: 'Olalere',
    lastName: 'Olawale',
    status: '07-agreement-signed',
    dealValue: 39900,
    closeProbability: 30,
    salesperson: 'Chris McDougall',
    createdAt: '2023-11-10',
    updatedAt: '2023-11-13',
  },
];

// Pipeline stages with counts
interface PipelineStage {
  id: string;
  title: string;
  count: number;
}

export default function KanbanPage() {
  const theme = useTheme();
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stages, setStages] = useState<PipelineStage[]>([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // Use mock data instead of API call
      setTimeout(() => {
        const records = mockSalesPipelineData;
        const organizedColumns = organizeRecordsByStatus(records);
        setColumns(organizedColumns);

        // Calculate counts for each stage
        const stagesList = [
          { id: '01-lead', title: '01 - Lead', count: 0 },
          { id: '04-roadmap-call', title: '04 - Roadmap Call', count: 0 },
          { id: '05-passport-requested', title: '05 - Passport Requested', count: 0 },
          { id: '06-agreement-sent', title: '06 - Agreement Sent', count: 0 },
          { id: '07-agreement-signed', title: '07 - Agreement Signed', count: 0 },
          { id: '10-disqualified', title: '10 - Disqualified', count: 0 },
        ];

        // Count records for each stage
        records.forEach((record) => {
          const stage = stagesList.find((s) => s.id === record.status);
          if (stage) {
            stage.count += 1;
          }
        });

        setStages(stagesList);
        setLoading(false);
      }, 500); // Simulate API delay
    } catch (error) {
      console.error('Error fetching sales pipeline records:', error);
      setLoading(false);
    }
  };

  // Local implementation of organizeRecordsByStatus
  const organizeRecordsByStatus = (records: KanbanRecord[]): KanbanColumn[] => {
    const kanbanColumns: KanbanColumn[] = [
      { id: '01-lead', title: '01 - Lead', records: [] },
      { id: '04-roadmap-call', title: '04 - Roadmap Call', records: [] },
      { id: '05-passport-requested', title: '05 - Passport Requested', records: [] },
      { id: '06-agreement-sent', title: '06 - Agreement Sent', records: [] },
      { id: '07-agreement-signed', title: '07 - Agreement Signed', records: [] },
      { id: '10-disqualified', title: '10 - Disqualified', records: [] },
    ];

    records.forEach((record) => {
      const column = kanbanColumns.find((col) => col.id === record.status);
      if (column) {
        column.records.push(record);
      } else {
        // If status doesn't match any column, default to lead
        kanbanColumns[0].records.push({ ...record, status: '01-lead' });
      }
    });

    return kanbanColumns;
  };

  const handleRecordUpdate = async (updatedRecord: KanbanRecord) => {
    try {
      // Mock update - just update local state
      setColumns((prevColumns) =>
        prevColumns.map((column) => ({
          ...column,
          records:
            column.id === updatedRecord.status
              ? [...column.records.filter((r) => r.id !== updatedRecord.id), updatedRecord]
              : column.records.filter((r) => r.id !== updatedRecord.id),
        }))
      );

      // Update stage counts
      updateStageCounts();
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const handleRecordDelete = async (recordId: string) => {
    try {
      // Mock delete - just update local state
      setColumns((prevColumns) =>
        prevColumns.map((column) => ({
          ...column,
          records: column.records.filter((r) => r.id !== recordId),
        }))
      );

      // Update stage counts
      updateStageCounts();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const updateStageCounts = () => {
    const updatedStages = [...stages];

    // Reset counts
    updatedStages.forEach((stage) => {
      stage.count = 0;
    });

    // Count records in each column
    columns.forEach((column) => {
      const stage = updatedStages.find((s) => s.id === column.id);
      if (stage) {
        stage.count = column.records.length;
      }
    });

    setStages(updatedStages);
  };

  const handleAddLead = () => {
    // Create a new mock lead
    const newLead: KanbanRecord = {
      id: `lead-${Date.now()}`, // Generate a unique ID
      title: 'New Lead',
      lastName: '',
      status: '01-lead',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to columns state
    setColumns((prevColumns) =>
      prevColumns.map((column) =>
        column.id === '01-lead' ? { ...column, records: [...column.records, newLead] } : column
      )
    );

    // Update stage counts
    updateStageCounts();
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Custom card renderer for the KanbanBoard
  const renderCard = (record: KanbanRecord) => (
    <Box
      sx={{
        p: 2,
        mb: 1,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold">
        {record.id} - {record.title}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Last Name
      </Typography>
      <Typography variant="body1" gutterBottom>
        {record.lastName}
      </Typography>

      {record.dealValue && (
        <>
          <Typography variant="body2" color="text.secondary">
            Deal Value
          </Typography>
          <Typography variant="body1" gutterBottom>
            {formatCurrency(record.dealValue)}
          </Typography>
        </>
      )}

      {record.closeProbability !== undefined && (
        <>
          <Typography variant="body2" color="text.secondary">
            Close Probability
          </Typography>
          <Typography variant="body1" gutterBottom>
            {record.closeProbability}%
          </Typography>
        </>
      )}

      {record.salesperson && (
        <>
          <Typography variant="body2" color="text.secondary">
            Salesperson
          </Typography>
          <Typography variant="body1">{record.salesperson}</Typography>
        </>
      )}
    </Box>
  );

  return (
    <Container maxWidth={false}>
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Sales Pipeline
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            pb: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              display: 'flex',
              alignItems: 'center',
              mr: 2,
            }}
          >
            Sales Motion
            <Iconify icon="mdi:chevron-right" width={20} height={20} />
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 'auto' }}>
            Pipeline
          </Typography>

          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:plus" />}
            sx={{ mr: 2 }}
            onClick={handleAddLead}
          >
            Add Lead
          </Button>

          <Button
            variant="outlined"
            startIcon={<Iconify icon="mdi:filter-outline" />}
            sx={{ mr: 1 }}
          >
            Filter
          </Button>

          <Button variant="outlined" startIcon={<Iconify icon="mdi:sort" />} sx={{ mr: 1 }}>
            Sort
          </Button>

          <Typography variant="body2" sx={{ mx: 2, fontWeight: 'bold' }}>
            1
          </Typography>

          <TextField
            placeholder="Search..."
            size="small"
            sx={{ width: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="mdi:magnify" width={20} height={20} />
                </InputAdornment>
              ),
            }}
          />

          <IconButton sx={{ ml: 1 }}>
            <Iconify icon="mdi:information-outline" width={20} height={20} />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <Typography>Loading pipeline...</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              height: 'calc(100vh - 200px)',
              '& .kanban-column': {
                bgcolor: theme.palette.background.default,
                borderRadius: 1,
                p: 2,
                mx: 1,
              },
              '& .kanban-column-header': {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              },
            }}
          >
            <KanbanBoard
              columns={columns}
              onRecordUpdate={handleRecordUpdate}
              onRecordDelete={handleRecordDelete}
              renderCustomCard={renderCard}
              renderColumnHeader={(column: KanbanColumn) => (
                <Box className="kanban-column-header">
                  <Typography variant="subtitle1" fontWeight="bold">
                    {column.title.split(' - ')[0]}{' '}
                    <Typography component="span" color="text.secondary">
                      {stages.find((s) => s.id === column.id)?.count || 0}
                    </Typography>
                  </Typography>
                </Box>
              )}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
}
