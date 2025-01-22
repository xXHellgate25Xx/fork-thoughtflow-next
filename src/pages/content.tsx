import { Helmet } from 'react-helmet-async';
import { useState, useCallback } from 'react';
import { CONFIG } from 'src/config-global';
import { Scrollbar } from 'src/components/scrollbar';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { ContentTableRow } from 'src/sections/tables/content-table-row';
import { CustomTableHead } from 'src/sections/tables/idea-table-head';
import { TableEmptyRows } from 'src/sections/tables/table-empty-row';
import { emptyRows, applyFilter, getComparator } from 'src/sections/tables/utils';
import type { ContentProps } from 'src/sections/tables/content-table-row';
import { Label } from 'src/components/label';

import { Box, Button, Card, Typography, Table, TableBody } from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import { Icon } from '@iconify/react';
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
  const [numContent, setNumContent] = useState(123);
  const [numPublished, setNumPublished] = useState(123);
  const [numDraft, setNumDraft] = useState(123);
  const [numArchived, setNumArchived] = useState(123);

  const table = useTable();  
  const data: ContentProps[] = [
    {
      id: '1',
      title: 'Title of content 1',
      pillar: 'Pillar 1',
      status: 'published',
      views: 1234,
      updatedAt: '2025-01-21 06:52PM',
    },
    {
      id: '2',
      title: 'Title of content 2',
      pillar: 'Pillar 2',
      status: 'draft',
      views: 2345,
      updatedAt: '2025-01-21 06:52PM',
    },
    {
      id: '3',
      title: 'Title of content 3',
      pillar: 'Pillar 2',
      status: 'archived',
      views: 2345,
      updatedAt: '2025-01-21 06:52PM',
    },
  ]

  const dataFiltered = applyFilter({
    inputData: data,
    comparator: getComparator(table.order, table.orderBy),
  });

  return (
    <>
      <Helmet>
        <title> {`Contents - ${CONFIG.appName}`}</title>
        <meta
          name="description"
          content="Details of a content pillar"
        />
        <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />
      </Helmet>

      <DashboardContent>
        {/* Navigation and title */}
        <Box display="flex" alignItems="center" mb='2rem' gap='1rem'>
          <Typography variant='h4' flexGrow={1}>
            Contents
          </Typography>
          <Button 
            size='large'
            variant='contained' 
            color='primary'
            startIcon={<Icon icon='hugeicons:idea-01'/>}
          >What&apos;s on your mind?
          </Button>
          <Button 
            size='large'
            variant='contained' 
            color='inherit'
            startIcon={<Icon icon='ri:import-line'/>}
          >Import Content
          </Button>
        </Box>

        {/* Basic stats */}
        <Box display="flex" alignItems="center" mb='2rem' gap='1rem'>
          <Card sx={{ padding: '2rem', width: '25%' }}>
            <Typography >Total Contents</Typography>
            <Typography variant='h6'>{numContent}</Typography>
          </Card>
          <Card sx={{ padding: '2rem', width: '25%' }}>
            <Label color='success'>PUBLISHED</Label>
            <Typography variant='h6'>{numPublished}</Typography>
          </Card>
          <Card sx={{ padding: '2rem', width: '25%' }}>
            <Label color='info'>DRAFT</Label>
            <Typography variant='h6'>{numDraft}</Typography>
          </Card>
          <Card sx={{ padding: '2rem', width: '25%' }}>
            <Label color='default'>ARCHIVED</Label>
            <Typography variant='h6'>{numArchived}</Typography>
          </Card>
        </Box>

        <Card>
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <CustomTableHead
                  order={table.order}
                  orderBy={table.orderBy}
                  rowCount={data?.length ?? 0}
                  onSort={table.onSort}
                  headLabel={[
                    { id: 'title', label: 'Title' },
                    { id: 'pillar', label: 'Pillar' },
                    { id: 'status', label: 'Status' },
                    { id: 'views', label: 'Views' },
                    { id: 'updatedAt', label: 'Last Modified' },
                    { id: '' },
                  ]}
                />
                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <ContentTableRow
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

          <TablePagination
            component="div"
            page={table.page}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>

      </DashboardContent>
    </>
  );
}
