import { Helmet } from 'react-helmet-async';
import { useState, useCallback, useEffect } from 'react';
import { CONFIG } from 'src/config-global';
import { Scrollbar } from 'src/components/scrollbar';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { IdeaTableRow } from 'src/sections/tables/idea-table-row';
import { ContentTableRow } from 'src/sections/tables/content-table-row';
import { CustomTableHead } from 'src/sections/tables/idea-table-head';
import { TableEmptyRows } from 'src/sections/tables/table-empty-row';
import { emptyRows, applyFilter, getComparator } from 'src/sections/tables/utils';
import type { IdeaProps } from 'src/sections/tables/idea-table-row';
import type { ContentProps } from 'src/sections/tables/content-table-row';
import { Label } from 'src/components/label';

import { Box, Button, Card, Typography, Table, TableBody } from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import { Icon } from '@iconify/react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetPillarByIdQuery,
  useGetIdeasOfPillarQuery,
  useUpdatePillarNameMutation,
  useDeactivatePillarMutation,
  useGetAllContentsFromPillarIdQuery,
  Content,
} from 'src/libs/service/pillar/pillar-item';
import { useRouter } from 'src/routes/hooks';
import { GenericModal } from 'src/components/modal/generic-modal';
import { fDateTime } from 'src/utils/format-time';
import { useDeleteContentMutation } from 'src/libs/service/content/content';

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
  const { 'pillar-id': pillarId } = useParams();
  const {
    data: pillarData,
    isLoading: getPillarIsLoading,
    refetch: getPillarRefetch,
  } = useGetPillarByIdQuery({ pillarId });
  const pillar = pillarData?.data[0];
  const pillarIsActive = getPillarIsLoading ? null : pillar?.is_active;
  const [pillarName, setPillarName] = useState<string>('Title of content pillar');
  const [isActive, setIsActive] = useState(true);
  const { data: ideasOfPillar, isLoading: getIdeasOfPillarIsLoading } = useGetIdeasOfPillarQuery({
    pillarId,
  });
  const {
    data: allContentsApiRes,
    isLoading,
    refetch:refetchAllContentFromPillar,
  } = useGetAllContentsFromPillarIdQuery({ pillarId });
  const table = useTable();
  const mapContentsApiResToTable = (inputs: Content[]): ContentProps[] =>
    inputs.map((input) => ({
      id: input.content_id,
      title: input.title,
      channelType: input.channel_type,
      pillar: input.pillar,
      status: input.status,
      views: input.pageviews,
      updatedAt: input.last_modified,
      updatedAtFormatted: fDateTime(input.last_modified, 'DD MMM YYYY h:mm a'),
    }));
  const data = allContentsApiRes?.data ? mapContentsApiResToTable(allContentsApiRes?.data) : [];

  useEffect(() => {
    setPillarName(pillar?.name ?? "Loading... ");
  }, [pillar]);
  // const data_: IdeaProps[] = ideasOfPillar?.data.map(idea => ({
  //   id: idea.id,
  //   title: idea.title,
  //   text: idea.text,
  //   createdAt: idea.created_at,
  // })) ?? [];
  // const data: ContentProps[] = [
  //   {
  //     id: '1',
  //     title: 'Title of content 1',
  //     pillar: 'Pillar 1',
  //     status: 'published',
  //     views: 1234,
  //     updatedAt: '2025-01-21 06:52PM',
  //     updatedAtFormatted: '21 Jan 2025 06:52 pm',
  //   },
  //   {
  //     id: '2',
  //     title: 'Title of content 2',
  //     pillar: 'Pillar 2',
  //     status: 'draft',
  //     views: 2345,
  //     updatedAt: '2025-01-21 06:52PM',
  //     updatedAtFormatted: '21 Jan 2025 06:52 pm',
  //   },
  //   {
  //     id: '3',
  //     title: 'Title of content 3',
  //     pillar: 'Pillar 2',
  //     status: 'archived',
  //     views: 2345,
  //     updatedAt: '2025-01-21 06:52PM',
  //     updatedAtFormatted: '21 Jan 2025 06:52 pm',
  //   },
  // ]
  const router = useRouter();
  const handleGoBack = () => {
    router.back();
  };

  const dataFiltered = applyFilter({
    inputData: data,
    comparator: getComparator(table.order, table.orderBy),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmClicked, setIsConfirmClicked] = useState(false);

  const [UpdatePillarNameMutation, _] = useUpdatePillarNameMutation();

  const handleAddItem = async (newName: string) => {
    try {
      setIsConfirmClicked(true);
      await UpdatePillarNameMutation({ pillarId, newName }).unwrap();
      getPillarRefetch();
      setIsModalOpen(false);
    } catch (addItemError) {
      console.error('Error creating pillar:', addItemError);
    } finally {
      setIsConfirmClicked(false);
    }
  };

  const [DeactivatePillarMutation, _2] = useDeactivatePillarMutation();

  const handleDeactivateButton = async () => {
    await DeactivatePillarMutation({ pillarId });
    getPillarRefetch();
  };
  const [DeleteContentMutation, ] = useDeleteContentMutation();
  const onDelete = async(content_id: string) => {
    await DeleteContentMutation(content_id);
    refetchAllContentFromPillar();
  };

  const navigate = useNavigate();

  const handleAddContent = () => {
    navigate('/create',{
      replace: true,
      state: { id: pillarId, name: pillarName }
    });
  };

  return (
    <>
      <Helmet>
        <title> {`${pillarName} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Details of a content pillar" />
        <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />
      </Helmet>

      <DashboardContent>
        {/* Navigation and title */}
        <Box display="flex" alignItems="center" mb="1rem" gap="1rem">
          <Button color="inherit">
            <Icon icon="ep:back" width={30} onClick={handleGoBack} />
          </Button>
          <Label color={pillarIsActive === null ? 'default' : pillarIsActive ? 'success' : 'info'}>
            {pillarIsActive === null ? 'Loading...' : pillarIsActive ? 'Active' : 'Inactive'}
          </Label>
          <Typography variant="h4">{pillar?.name}</Typography>
        </Box>

        {/* Buttons to edit and deactivate */}
        <Box display="flex" alignItems="center" gap="0.5rem" mb="1rem">
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Icon icon="akar-icons:edit" />}
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <GenericModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAddItem={handleAddItem}
            isLoading={isConfirmClicked}
            modalTitle="Change Pillar Name"
            textFieldText="New Name"
            buttonText="Change"
          />
          <Button
            variant="outlined"
            color={pillarIsActive ? 'error' : 'inherit'}
            startIcon={pillarIsActive ? <Icon icon="solar:archive-bold" /> : null}
            onClick={handleDeactivateButton}
          >
            {pillarIsActive ? 'Deactivate' : 'Currently Not Active'}
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Icon icon="akar-icons:circle-plus" />}
            onClick={handleAddContent}
          >
            Add Content
          </Button>
        </Box>

        <Typography variant="h5" mb="1rem">
          Content
        </Typography>

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
                    { id: 'channelType', label: 'Channel Type' },
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
                        onClickRow={(id)=>{router.push(`/content/${id}`)}}
                        onDeleteRow={onDelete}
                      />
                    ))}

                  <TableEmptyRows
                    height={68}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, data?.length ?? 0)}
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
