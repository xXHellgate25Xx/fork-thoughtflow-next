import { Helmet } from 'react-helmet-async';
import { useState, useCallback } from 'react';
import { CONFIG } from 'src/config-global';
import { Scrollbar } from 'src/components/scrollbar';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { IdeaTableRow } from 'src/sections/tables/idea-table-row';
import { CustomTableHead } from 'src/sections/tables/idea-table-head';
import { TableEmptyRows } from 'src/sections/tables/table-empty-row';
import { emptyRows, applyFilter, getComparator } from 'src/sections/tables/utils';
import type { IdeaProps } from 'src/sections/tables/idea-table-row';
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
  const [pillarName, setPillarName] = useState('Title of content pillar');
  const [isActive, setIsActive] = useState(true);

  const table = useTable();  
  const data: IdeaProps[] = [
    {
      id: '1',
      title: 'Title of idea 1',
      text: 'Full text of idea Full text of idea Full text of idea Full text of idea',
      createdAt: '2025-01-21 06:52PM',
    },
    {
      id: '2',
      title: 'Title of idea 2',
      text: 'Full text of idea Full text of idea Full text of idea Full text of idea',
      createdAt: '2025-01-21 06:59PM',
    }
  ]

  const dataFiltered: IdeaProps[] = applyFilter({
    inputData: data,
    comparator: getComparator(table.order, table.orderBy),
  });

  return (
    <>
      <Helmet>
        <title> {`${pillarName} - ${CONFIG.appName}`}</title>
        <meta
          name="description"
          content="Details of a content pillar"
        />
        <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />
      </Helmet>

      <DashboardContent>
        {/* Navigation and title */}
        <Box display="flex" alignItems="center" mb='1rem' gap='1rem'>
          <Button color='inherit'>
            <Icon icon='ep:back' width={30}/>
          </Button>
          <Label 
            color={isActive ? 'success' : 'info'}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Label>
          <Typography variant='h4'>
            Title of content pillar
          </Typography>
        </Box>

        {/* Buttons to edit and deactivate */}
        <Box display="flex" alignItems="center" gap='0.5rem' mb='1rem'>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Icon icon="akar-icons:edit" />}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Icon icon="solar:archive-bold" />}
          >
            Deactivate
          </Button>
        </Box>

        <Card>
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <CustomTableHead
                  order={table.order}
                  orderBy={table.orderBy}
                  rowCount={data.length}
                  onSort={table.onSort}
                  headLabel={[
                    { id: 'title', label: 'Title' },
                    { id: 'text', label: 'Idea' },
                    { id: 'createdAt', label: 'Created At' },
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
                      <IdeaTableRow
                        key={row.id}
                        row={row}
                      />
                    ))}

                  <TableEmptyRows
                    height={68}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, data.length)}
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
