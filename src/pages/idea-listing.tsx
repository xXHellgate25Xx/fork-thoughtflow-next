import { Icon } from '@iconify/react';
import {
  CellContext,
  ColumnDef,
  flexRender,
  getCoreRowModel, getPaginationRowModel,
  PaginationState,
  useReactTable
} from '@tanstack/react-table';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { useGetIdeasByPillarQuery } from 'src/libs/service/idea/idea-listing';
import { useGetAllPillarQuery } from 'src/libs/service/pillar/home';

import { Button } from 'src/components/ui/button';
import { FilterDropdown } from 'src/components/ui/FilterDropdown';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table';
import { getFormattedDate } from 'src/libs/utils/TimeUtil';
import type { HierarchicalOption } from 'src/types/filterDropdownTypes';

// ----------------------------------------------------------------------

interface IdeaItem {
  account_id: string;
  text: string;
  title: string;
  is_deleted: boolean;
  pillar_id: string;
  pillar: string;
  page_view: number;
  count_contents?: number;
  created_at: string;
  idea_id?: string; // This is the actual ID field from the API
}

// Add this type for column meta
type MyColumnMeta = { sortable?: boolean, center?: boolean };

function IdeaTableSkeletonRows({ rowCount, colCount }: { rowCount: number, colCount: number }) {
  return (
    <>
      {[...Array(rowCount)].map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {[...Array(colCount)].map((_2, colIndex) => (
            <TableCell key={colIndex} className="py-3 px-2">
              <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// Use MyColumnMeta as a type assertion for meta
const columns: ColumnDef<IdeaItem, any>[] = [
  {
    accessorKey: 'text',
    header: 'Idea',
    meta: { sortable: true, center: false } as MyColumnMeta,
    cell: (info: CellContext<IdeaItem, any>) => (
      <p className="overflow-hidden line-clamp-3 wrap-break-word">{info.getValue() as string}</p>
    ),
  },
  {
    accessorKey: 'pillar',
    header: 'Pillar',
    meta: { sortable: true, center: false } as MyColumnMeta,
    cell: (info: CellContext<IdeaItem, any>) => <span>{info.getValue() as string}</span>,
  },
  {
    accessorKey: 'page_view',
    header: () => <div className="text-center">Views</div>,
    meta: { sortable: true, center: true } as MyColumnMeta,
    cell: (info: CellContext<IdeaItem, any>) => (
      <div className="flex items-center justify-center gap-1 text-center">
        <Icon icon="mdi:eye-outline" width={18} height={18} />
        {info.getValue() || 0}
      </div>
    ),
  },
  {
    accessorKey: 'count_contents',
    header: () => <div className="text-center">Contents</div>,
    meta: { sortable: true, center: true } as MyColumnMeta,
    cell: (info: CellContext<IdeaItem, any>) => <div className="text-center">{info.getValue() || 0}</div>,
  },
  {
    accessorKey: 'created_at',
    header: 'Date',
    meta: { sortable: true, center: true } as MyColumnMeta,
    cell: (info: CellContext<IdeaItem, any>) => <div className='text-center'  >{getFormattedDate(new Date(info.getValue() as string))}</div>,
  },
];

export default function Page() {
  // TanStack Table pagination state
  const [pageIndex, setPageIndex] = useState<number>(0); // 0-based
  const [pageSize, setPageSize] = useState<number>(10);
  const [filters, setFilters] = useState({ selectedPillar: '', selectedTimeRange: '30', sort_field: 'created_at', sort_direction: 'desc' });

  const router = useRouter();
  // const [isContentDeleting, setIsContentDeleting] = useState(false);
  // const { data: allContentsData, refetch: refetchAllContent } = useGetAllContentsOfUserQuery();
  // const { data: allStatsApiData, refetch: refetchAllStat } = useGetAllStatsOfUserQuery();

  // Build query params using useMemo
  const queryParams = React.useMemo(() => {
    const params: any = {
      page: pageIndex + 1,
      page_size: pageSize,
    };
    if (filters.selectedPillar) params.pillar_id = filters.selectedPillar;
    if (filters.selectedTimeRange && filters.selectedTimeRange !== '') {
      const days = parseInt(filters.selectedTimeRange, 10);
      if (!Number.isNaN(days)) {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        params.created_from = fromDate.toISOString().slice(0, 10);
      }
    }
    if (filters.sort_field) params.sort_field = filters.sort_field;
    if (filters.sort_direction) params.sort_direction = filters.sort_direction;
    return params;
  }, [pageIndex, pageSize, filters]);

  const { data: ideasResponse, isLoading: isIdeasLoading, isFetching: isIdeasFetching } = useGetIdeasByPillarQuery(queryParams);
  const isLoading = isIdeasLoading || isIdeasFetching;
  const paginatedIdeas: IdeaItem[] = ideasResponse?.data || [];

  // Use pagination from ideasResponse if available
  const currentPage = ideasResponse?.pagination?.page ?? pageIndex + 1;
  const currentPageSize = ideasResponse?.pagination?.page_size ?? pageSize;
  const totalCount = ideasResponse?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / currentPageSize));

  // TanStack Table instance
  const table = useReactTable({
    data: paginatedIdeas,
    columns,
    pageCount: totalPages,
    state: {
      pagination: { pageIndex, pageSize },
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (up: PaginationState | ((old: PaginationState) => PaginationState)) => {
      if (typeof up === 'function') {
        const next = up({ pageIndex, pageSize });
        setPageIndex(next.pageIndex);
        setPageSize(next.pageSize);
      } else {
        setPageIndex(up.pageIndex);
        setPageSize(up.pageSize);
      }
    },
  });

  // Transform content data
  // const mapContentArray = (inputs: any[]): any[] =>
  //   inputs.map((input) => ({
  //     id: input.content_id,
  //     title: input.title,
  //     channelType: input.channel_type,
  //     pillar: input.pillar,
  //     status: input.status,
  //     views: input.pageviews,
  //     updatedAt: input.last_modified,
  //     updatedAtFormatted: fDateTime(input.last_modified, "DD MMM YYYY h:mm a"),
  //   }));

  // const contentData = allContentsData?.data ? mapContentArray(allContentsData.data) : [];

  // Set content stats
  // const contentStats = React.useMemo(() => {
  //   const userStatData = allStatsApiData?.data?.[0];
  //   if (userStatData) {
  //     return {
  //       numPublished: userStatData.published,
  //       numDraft: userStatData.draft,
  //       numContent: userStatData.total,
  //     };
  //   }
  //   return { numPublished: 0, numDraft: 0, numContent: 0 };
  // }, [allStatsApiData]);


  const handleNewIdea = () => {
    router.push("/create");
  };

  // Content handlers
  // const handleContentClick = (content_id: string) => {
  //   router.push(`content/${content_id}`);
  // };

  const handleIdeaClick = (idea_id: string | undefined) => {
    if (idea_id) {
      router.push(`/idea/${idea_id}`);
    }
  };

  // const [DeleteContentMutation] = useDeleteContentMutation();

  // const handleContentDelete = async (content_id: string) => {
  //   try {
  //     setIsContentDeleting(true);
  //     await DeleteContentMutation(content_id);
  //     refetchAllContent();
  //     refetchAllStat();
  //   } finally {
  //     setIsContentDeleting(false);
  //   }
  // };

  // FilterDropdown onChange handler
  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field === 'pillar' ? 'selectedPillar' : field === 'timeRange' ? 'selectedTimeRange' : field]: value }));
    setPageIndex(0); // Reset to first page on filter change
  };

  // Table header sort handler
  const handleTableSort = (field: string) => {
    // Only allow sorting on allowed fields
    const allowed = ['created_at', 'title', 'pillar_id', 'status', 'text', 'pillar', 'page_view', 'count_contents'];
    if (!allowed.includes(field)) return;
    setFilters((prev) => {
      if (prev.sort_field === field) {
        // Toggle direction
        return { ...prev, sort_direction: prev.sort_direction === 'asc' ? 'desc' : 'asc' };
      }
      // Set new field, default to desc
      return { ...prev, sort_field: field, sort_direction: 'desc' };
    });
    setPageIndex(0);
  };

  // Render sort icon for table headers
  const renderSortIcon = (field: string) => {
    if (filters.sort_field !== field) return null;
    return (
      <ChevronDown
        className={`ml-2 h-4 w-4 transition-transform ${filters.sort_direction === 'asc' ? 'rotate-180' : ''}`}
      />
    );
  };

  // Fetch pillars for dropdown
  const { data: pillarData } = useGetAllPillarQuery();
  const pillarOptions: HierarchicalOption[] = (pillarData?.data || []).map((pillar: any) => ({
    value: pillar.id,
    label: pillar.name,
  }));
  pillarOptions.unshift({ value: '', label: 'All Pillars' });

  // Time range options
  const timeRangeOptions: HierarchicalOption[] = [
    { value: '7', label: '7 days' },
    { value: '30', label: '30 days' },
    { value: '90', label: '90 days' },
    { value: '', label: 'All Time' },
  ];

  return (
    <>
      <Helmet>
        <title> {`Ideas - ${CONFIG.appName}`}</title>
        <meta
          name="description"
          content="ThoughtFlow Ideas"
        />
      </Helmet>

      <DashboardContent className='gap-6'>
        <div className="flex items-center h-10 justify-between w-full ">
          <h4 className="text-2xl font-medium">Ideas</h4>
          <Button
            type="button"
            variant="default"
            className="bg-[#00396E] text-white px-6 py-2 rounded-lg flex items-center gap-3 hover:bg-[#002a52] transition-colors font-bold shadow text-sm"
            onClick={handleNewIdea}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path d="M12 4v16m-8-8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className='text-sm font-semibold'>New Idea</span>
          </Button>
        </div>
        {/* Horizontal filter row */}
        <div className='flex items-center gap-6 mt-2 mb-2'>
          <div className='flex items-center gap-2 font-sans'>
            <span className="text-gray-800 text-sm font-normal leading-none align-middle">Last</span>
            <FilterDropdown
              field="timeRange"
              placeholder="30 days"
              options={timeRangeOptions}
              currentValue={filters.selectedTimeRange}
              onChange={handleFilterChange}
              buttonVariant="naked"
              buttonClassName="text-sm font-normal p-0 h-full"
            />
          </div>
          <div className='flex items-center gap-2'>
            <span className="text-gray-800 text-sm font-normal">Filter by</span>
            <FilterDropdown
              field="pillar"
              placeholder="All Pillars"
              options={pillarOptions}
              currentValue={filters.selectedPillar}
              buttonVariant='naked'
              onChange={handleFilterChange}
              buttonClassName="text-sm font-normal p-0 h-full"
            />
          </div>
        </div>
        <div className='w-full h-[1px] bg-[#EDEDED]' />
        {/* Ideas Section */}
        <div className="bg-white rounded-xl shadow-xl/3">
          {paginatedIdeas.length || isLoading ? (
            <div className="overflow-x-auto">
              <Table className="w-full text-sm table-auto">
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id} className="border-b-gray-200 text-gray-700 font-medium text-base">
                      {headerGroup.headers.map(header => {
                        const meta = header.column.columnDef.meta as MyColumnMeta | undefined;
                        const isCenter = meta?.center ?? false;
                        return (
                          <TableHead
                            key={header.id}
                            className={` hover:bg-muted/50 ${meta?.sortable ? 'cursor-pointer select-none' : ''} ${isCenter ? 'text-center' : ''}`}
                            onClick={
                              meta?.sortable
                                ? () => handleTableSort(header.column.id)
                                : undefined
                            }
                          >
                            {isCenter ? (
                              <span className="flex items-center justify-center w-full">
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                {meta?.sortable && renderSortIcon(header.column.id)}
                              </span>
                            ) : (
                              <span className="flex items-center">
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                {meta?.sortable && renderSortIcon(header.column.id)}
                              </span>
                            )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <IdeaTableSkeletonRows rowCount={pageSize} colCount={columns.length} />
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="border-0 text-sm font-normal cursor-pointer text-gray-900 hover:bg-gray-50" onClick={() => handleIdeaClick(row.original.idea_id)}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className='max-w-[300px]'  >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">No ideas found.</p>
            </div>
          )}
          {/* Pagination always visible, disabled when loading */}
          <div className="flex items-center justify-end gap-3 p-4 border-t mt-2 px-10">
            <div className="flex items-center gap-1 text-sm text-gray-800">
              <span>Rows per page:</span>
              <div className="relative">
                <FilterDropdown
                  field="pageSize"
                  placeholder="10"
                  options={[{ value: "10", label: "10" }, { value: "25", label: "25" }, { value: "50", label: "50" }, { value: "100", label: "100" }]}
                  currentValue={currentPageSize.toString()}
                  isGrouped={false}
                  onChange={(field, value) => setPageSize(parseInt(value, 10))}
                  buttonVariant="unstyled"
                  buttonClassName="text-sm font-normal hover:bg-gray-200 rounded-none h-full px-1 py-0"
                />
              </div>
            </div>
            <div className="text-sm text-gray-800 min-w-[110px] text-center pl-3">
              {`${(currentPage - 1) * currentPageSize + 1}-${Math.min(currentPage * currentPageSize, totalCount)} of ${totalCount}`}
            </div>
            <div className='flex items-center gap-1'>

              <Button
                variant="unstyled"
                size="icon"
                onClick={() => setPageIndex(currentPage - 2)}
                disabled={isLoading || currentPage <= 1}
                className="p-1 rounded disabled:text-gray-300 text-gray-700 hover:bg-gray-100"
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="unstyled"
                onClick={() => setPageIndex(currentPage)}
                disabled={isLoading || currentPage >= totalPages}
                className="p-1 rounded disabled:text-gray-300 text-gray-700 hover:bg-gray-100"
                aria-label="Next Page"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </DashboardContent >
    </>
  );
} 