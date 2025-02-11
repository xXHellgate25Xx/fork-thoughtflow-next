import { Helmet } from 'react-helmet-async';
import { useState, useCallback, useEffect } from 'react';
import { CONFIG } from 'src/config-global';
import { Scrollbar } from 'src/components/scrollbar';
import TableContainer from '@mui/material/TableContainer';
import { TableEmptyRows } from 'src/sections/tables/table-empty-row';
import { emptyRows, applyFilter, getComparator } from 'src/sections/tables/utils';
import { ChannelTableRow, type ChannelProps } from 'src/sections/tables/channel-table-row';
import { useGetAllChannelsOfUserQuery } from 'src/libs/service/channel/channel';
import { useGetAllContentsOfUserQuery } from 'src/libs/service/content/content';

import { 
  Box, 
  Button, 
  Card, 
  Typography, 
  Table, 
  TableBody,
  CircularProgress,
  Snackbar, 
  Alert, 
  AlertColor,
} from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import { Icon } from '@iconify/react';
import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    rowsPerPage,
    onResetPage,
    onChangePage,
    onChangeRowsPerPage,
  };
}

export default function Page() {
  const router = useRouter();
  const table = useTable();  
  const [tableData, setTableData] = useState<ChannelProps[]>([]);
  const {
    data: channelData, 
    isFetching: channelIsFetching,
    refetch: channelRefetch,
  } = useGetAllChannelsOfUserQuery(); 

  const {
    data : allContentsData, 
    isFetching: contentIsFetching,
    refetch: refetchAllContent
  } = useGetAllContentsOfUserQuery();

  const [snackbar, setSnackbar] = useState<{
      open: boolean;
      message: string;
      severity: AlertColor;
    }>({
      open: false,
      message: '',
      severity: 'error',
    });
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePromptSubmission = () => {
    channelRefetch();
    setSnackbar({
      open: true,
      message: 'Prompt updated successfully!',
      severity: 'success'
    });
  };

  useEffect(()=>{
    if(channelData){
      setTableData(channelData?.data?.map(
        (channel: any) => {
          const mapping = {
            id: channel.id, 
            type: channel.channel_type, 
            name: channel.name, 
            url: channel.url,
            prompt: channel.brand_voice_initial,
            content: allContentsData?.data?.find(
              (contentItem) => 
                contentItem.channel_id === channel.id
            )?.content_body ?? '',
          };
          return mapping;
        }) ?? []
      );
    }
  },[channelData, allContentsData]);

  return (
    <>
      <Helmet>
        <title> {`Settings - ${CONFIG.appName}`}</title>
        <meta
          name="description"
          content="Settings"
        />
        <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />
      </Helmet>

      <DashboardContent>
        <Box mb='1rem' display='flex' alignItems='center'>
          <Typography variant='h4' flexGrow={1}>
            Channels
          </Typography>
          <Button 
            variant='contained' 
            color='inherit'
            startIcon={<Icon icon='mingcute:add-line'/>}
            sx={{ fontSize: '1rem' }}
            onClick={() => router.push('/add-channel')}
          >Add channel
          </Button>
        </Box>

        <Card>
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableBody>
                  {channelIsFetching?
                  (
                    <Box display="flex" alignItems="center" justifyContent="center" gap='2rem' sx={{p: 2}}>
                      <CircularProgress color='inherit'/>
                      <Typography>Fetching channels...</Typography>
                    </Box>
                  ):
                  tableData?.map((row) => (
                    <ChannelTableRow
                      key={row.id}
                      row={row}
                      onChannelSubmit={handlePromptSubmission}
                    />
                  ))}

                  <TableEmptyRows
                    height={68}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, (tableData?.length ?? 0))}
                  />

                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

        </Card>
      </DashboardContent>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
