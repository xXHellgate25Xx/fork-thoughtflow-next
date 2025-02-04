import { Helmet } from 'react-helmet-async';
import { useState, useCallback, useEffect } from 'react';
import { CONFIG } from 'src/config-global';
import { Scrollbar } from 'src/components/scrollbar';
import TableContainer from '@mui/material/TableContainer';
import { TableEmptyRows } from 'src/sections/tables/table-empty-row';
import { emptyRows, applyFilter, getComparator } from 'src/sections/tables/utils';
import { ChannelTableRow, type ChannelProps } from 'src/sections/tables/channel-table-row';
import { useGetAllChannelsOfUserQuery } from 'src/libs/service/channel/channel';

import { Box, Button, Card, Typography, Table, TableBody } from '@mui/material';
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
  const {data: channelData} = useGetAllChannelsOfUserQuery(); 

  const data: ChannelProps[] = channelData?.data?.map((channel: any) => {
    const mapping = {
      id: channel.id, 
      type: channel.channel_type, 
      name: channel.name, 
      url: channel.url,
      prompt: channel.brand_voice_initial
    };
    return mapping;
  }) || [
    { id: '1', type: 'wix', name: 'Wix channel', url: 'https://www.wix.com/', prompt: '' },
    { id: '2', type: 'linkedin', name: 'LinkedIn channel', url: 'https://www.linkedin.com/', prompt: '' },
  ];

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
                  {data
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <ChannelTableRow
                        key={row.id}
                        row={row}
                      />
                    ))}

                  <TableEmptyRows
                    height={68}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, (data?.length ?? 0))}
                  />

                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

        </Card>

      </DashboardContent>
    </>
  );
}
