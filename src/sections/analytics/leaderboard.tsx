// LeaderboardTable.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useRouter } from 'src/routes/hooks';


// Define the shape of each post's data
interface ContentStatsProps {
  id: number;
  title: string;
  pillar: string;
  viewsDaily: number;
  viewsWeekly: number;
  viewsAll: number;
}

interface LeaderboardTableProps {
  contentStats?: ContentStatsProps[];
  onClickRow?: () => void;
  title?: string;
}

// Sample data (replace with real data from your API)
const DUMMY_DATA: ContentStatsProps[] = [
  { id: 1, title: 'Very Very Very Very Very Long Post Very Very Very Very Very Long Post', pillar: 'Very Very Very Very Long Pillar Name', viewsDaily: 30,  viewsWeekly: 200, viewsAll: 1200 },
  { id: 2, title: 'Post B', pillar: 'Likewise',   viewsDaily: 25,  viewsWeekly: 190, viewsAll: 900  },
  { id: 3, title: 'Post C', pillar: 'Love', viewsDaily: 60,  viewsWeekly: 350, viewsAll: 2500 },
  { id: 4, title: 'Post D', pillar: 'Housing',   viewsDaily: 10,  viewsWeekly: 100, viewsAll: 600  },
  { id: 5, title: 'Post E', pillar: 'AI',   viewsDaily: 45,  viewsWeekly: 300, viewsAll: 2000 },
  { id: 6, title: 'Post F', pillar: 'Technology', viewsDaily: 70,  viewsWeekly: 102, viewsAll: 3000 },
  { id: 7, title: 'Post A1', pillar: 'Pillar 1', viewsDaily: 0,  viewsWeekly: 500, viewsAll: 5000 },
  { id: 8, title: 'Post B1', pillar: 'Pillar 1', viewsDaily: 0,  viewsWeekly: 10, viewsAll: 3000 },
  { id: 9, title: 'Post C1', pillar: 'Pillar 1', viewsDaily: 10,  viewsWeekly: 50, viewsAll: 2000 },
  { id: 10, title: 'Post D1', pillar: 'Pillar 2', viewsDaily: 32,  viewsWeekly: 500, viewsAll: 1000 },
  { id: 11, title: 'Post E1', pillar: 'Pillar 3', viewsDaily: 226,  viewsWeekly: 230, viewsAll: 230 },
  { id: 12, title: 'Post F1', pillar: 'Pillar 5', viewsDaily: 70,  viewsWeekly: 80, viewsAll: 500 },
];

// Possible time filters
type TimeFilter = 'all' | 'weekly' | 'daily';

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  contentStats=DUMMY_DATA,
  onClickRow,
  title="Leaderboard",
}) => {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [topCount, setTopCount] = useState<number>(5);

  // Helper to get the correct "views" based on the timeFilter
  const getViews = (post: ContentStatsProps) => {
    switch (timeFilter) {
      case 'daily':
        return post.viewsDaily;
      case 'weekly':
        return post.viewsWeekly;
      case 'all':
      default:
        return post.viewsAll;
    }
  };

  // Sort the data by the selected time filter in descending order,
  // then slice to the selected topCount.
  const sortedData = [...contentStats]
    .sort((a, b) => getViews(b) - getViews(a))
    .slice(0, topCount);

  // Handlers
  const handleTimeFilter = (filter: TimeFilter) => {
    setTimeFilter(filter);
  };

  const handleTopCountChange = (event: SelectChangeEvent) => {
    setTopCount(Number(event.target.value));
  };

  return (
    <Box sx={{ maxWidth: '600px', minWidth: '450px', mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>

      {/* Time Filter Buttons + Top Count Dropdown in the same row */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        {/* Left side: Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            variant={timeFilter === 'all' ? 'contained' : 'outlined'}
            onClick={() => handleTimeFilter('all')}
          >
            All Time
          </Button>
          <Button
            variant={timeFilter === 'weekly' ? 'contained' : 'outlined'}
            onClick={() => handleTimeFilter('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={timeFilter === 'daily' ? 'contained' : 'outlined'}
            onClick={() => handleTimeFilter('daily')}
          >
            Daily
          </Button>
        </Stack>

        {/* Right side: Top Count Dropdown */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel id="topCount-label">Show Top</InputLabel>
          <Select
            labelId="topCount-label"
            id="topCount"
            value={String(topCount)}
            label="Show Top"
            onChange={handleTopCountChange}
          >
            <MenuItem value="5">5</MenuItem>
            <MenuItem value="10">10</MenuItem>
            <MenuItem value="12">15</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Pillar</TableCell>
              <TableCell>Views</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((post, index) => (
              <TableRow
                key={post.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => 
                  {if (onClickRow) {onClickRow();}}
                }
              >
                <TableCell sx ={{ maxWidth: '100px'}}>{index + 1}</TableCell>
                <TableCell sx ={{ maxWidth: '200px'}}>{post.title}</TableCell>
                <TableCell sx ={{ maxWidth: '200px'}}>{post.pillar}</TableCell>
                <TableCell sx ={{ maxWidth: '100px'}}>{getViews(post)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LeaderboardTable;
