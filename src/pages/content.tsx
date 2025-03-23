import type {
  ContentApiRes} from 'src/libs/service/content/content';
import type { ContentProps } from 'src/sections/tables/content-table-row';

import { Icon } from '@iconify/react';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';

import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { Box, Card, Table, Button, TableBody, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { fDateTime } from 'src/utils/format-time';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { 
  useDeleteContentMutation,
  useGetAllStatsOfUserQuery,
  useGetAllContentsOfUserQuery
} from 'src/libs/service/content/content';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';

import { TableEmptyRows } from 'src/sections/tables/table-empty-row';
import { CustomTableHead } from 'src/sections/tables/idea-table-head';
import { ContentTableRow } from 'src/sections/tables/content-table-row';
import { emptyRows, applyFilter, getComparator } from 'src/sections/tables/utils';

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [rowsPerPage, setRowsPerPage] = useState(25);
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
  const [numContent, setNumContent] = useState(0);
  const [numPublished, setNumPublished] = useState(0);
  const [numDraft, setNumDraft] = useState(0);
  const [numArchived, setNumArchived] = useState(0);

  const table = useTable();  

  const {data : allContentsData, refetch:refetchAllContent} = useGetAllContentsOfUserQuery();

  const mapContentArray = (inputs: ContentApiRes[]): ContentProps[] =>
    inputs.map((input) => ({
      id: input.content_id,
      title: input.title,
      channelType: input.channel_type,
      pillar: input.pillar,
      status: input.status,
      views: input.pageviews,
      updatedAt: input.last_modified,
      updatedAtFormatted: fDateTime(input.last_modified, "DD MMM YYYY h:mm a"),
    }));
  
  const data = allContentsData?.data ? mapContentArray(allContentsData.data) : [];
  const {data : allStatsApiData, refetch:refetchAllStat} = useGetAllStatsOfUserQuery();
  const userStatData = allStatsApiData?.data[0];
  useEffect(() => {
    if (userStatData) {
      setNumPublished(userStatData.published);
      setNumDraft(userStatData.draft);
      setNumArchived(userStatData.archived);
      setNumContent(userStatData.total);
    }
  }, [userStatData]);

  const router = useRouter();

  const dataFiltered = applyFilter({
    inputData: data,
    comparator: getComparator(table.order, table.orderBy),
  });

  const onClickContent = (content_id:string) => {
    router.push(`content/${content_id}`)
  }

  const [DeleteContentMutation, ] = useDeleteContentMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async(content_id: string) => {
    try {
      setIsDeleting(true);
      await DeleteContentMutation(content_id);
      refetchAllContent();
      refetchAllStat();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title> {`Content - ${CONFIG.appName}`}</title>
        <meta
          name="description"
          content="List of content"
        />
        <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />
      </Helmet>

      <DashboardContent>
        {/* Navigation and title */}
        <Box display="flex" alignItems="center" mb='2rem' gap='1rem'>
          <Typography variant='h4' flexGrow={1}>
            Content
          </Typography>
          <Button 
            size='large'
            variant='contained' 
            color='primary'
            startIcon={<Icon icon='hugeicons:idea-01'/>}
            onClick={() => router.replace(`/create`)}
          >New Content
          </Button>
          <Button 
            size='large'
            variant='contained' 
            color='inherit'
            startIcon={<Icon icon='ri:import-line'/>}
            disabled
            sx={{ display: 'none' }}
          >Import Content
          </Button>
        </Box>

        {/* Basic stats */}
        <Box display="flex" alignItems="center" mb='2rem' gap='1rem'>
          <Card sx={{ padding: '2rem', width: '25%' }}>
            <Typography >Total Content</Typography>
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
          {/* <Card sx={{ padding: '2rem', width: '25%' }}>
            <Label color='default'>ARCHIVED</Label>
            <Typography variant='h6'>{numArchived}</Typography>
          </Card> */}
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
                    { id: 'channelType', label: 'Channel Type'},
                    { id: 'pillar', label: 'Pillar' },
                    { id: 'status', label: 'Status' },
                    { id: 'views', label: 'Views' },
                    { id: 'updatedAtFormatted', label: 'Last Modified' },
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
                        onClickRow={onClickContent}
                        onDeleteRow={onDelete}
                        isDeleting={isDeleting}
                        key={row.id}
                        row={row}
                      />
                    ))}

                  <TableEmptyRows
                    height={68}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, (data?.length ??  0))}
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
            rowsPerPageOptions={[25, 50, 75]}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>

      </DashboardContent>
    </>
  );
}
