"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { useLazyQueryTableQuery } from "src/libs/service/airtable/generalService";
import type {
  AirtableRecord,
  FilterCondition,
  QueryOptions,
  SortCondition
} from "src/types/airtableTypes";

// Interface for table hook results
interface TableQueryResult<T> {
  records: Partial<T>[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch: () => void;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  resetRecords: () => void;
}

export const useAirtableInfinite = <T>(tableId: string, opts: Omit<QueryOptions, 'tableId'> = {}): TableQueryResult<T> => {
  const [options, setOptions] = useState<Omit<QueryOptions, 'tableId'>>(opts)
  const [allRecords, setAllRecords] = useState<Partial<T>[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isProcessingData, setIsProcessingData] = useState(false)

  const prevFilters = useRef<FilterCondition[] | undefined>(opts.filters)
  const prevSort = useRef<SortCondition[] | undefined>(opts.sort)

  // Use lazy query to have more control over when to fetch
  const [fetchData, { data, isFetching, isError, error }] = useLazyQueryTableQuery()

  // Convert AirtableRecord to typed record
  const convertToTypedRecord = (record: AirtableRecord): Partial<T> => ({
    id: record.id,
    ...record.fields,
    createdTime: record.createdTime
  } as unknown as Partial<T>)

  // Combined effect for fetching and processing data
  useEffect(() => {
    const shouldReset = isInitialized && (
      JSON.stringify(prevFilters.current) !== JSON.stringify(opts.filters) || 
      JSON.stringify(prevSort.current) !== JSON.stringify(opts.sort)
    )

    if (!isInitialized || shouldReset) {
      prevFilters.current = opts.filters
      prevSort.current = opts.sort
      setOptions((prev: Omit<QueryOptions, 'tableId'>) => ({ ...prev, offset: "" }))
      setAllRecords([])
      setHasMore(true)
      setIsProcessingData(true)

      fetchData({ 
        tableId,
        ...opts,
        offset: "" 
      })
      setIsInitialized(true)
    }
  }, [opts.filters, opts.sort, opts.limit, opts.view, tableId, isInitialized, fetchData])

  // Process data when it arrives
  useEffect(() => {
    if (data?.records) {
      setIsProcessingData(true)
      setAllRecords((prev: Partial<T>[]) => (options.offset ? [...prev, ...data.records.map(convertToTypedRecord)] : data.records.map(convertToTypedRecord)))
      setOptions((prev: Omit<QueryOptions, 'tableId'>) => ({ ...prev, offset: data.offset || "" }))
      setHasMore(!!data.offset)
      setIsLoadingMore(false)
      setIsProcessingData(false)
    }
  }, [data])

  // Function to fetch next page
  const loadMore = useCallback(async () => {
    if (hasMore && !isFetching && options.offset) {
      setIsLoadingMore(true)
      setIsProcessingData(true)
      fetchData({ 
        tableId,
        ...options
      })
    }
  }, [hasMore, isFetching, options, tableId, fetchData])

  const resetRecords = useCallback(() => {
    setAllRecords([])
    setOptions((prev: Omit<QueryOptions, 'tableId'>) => ({ ...prev, offset: "" }))
    setHasMore(true)
    setIsInitialized(false)
  }, [])

  return {
    records: allRecords,
    isLoading: isFetching || isLoadingMore || isProcessingData,
    isError,
    error,
    refetch: () => {
      setOptions((prev: Omit<QueryOptions, 'tableId'>) => ({ ...prev, offset: "" }))
      setAllRecords([])
      setHasMore(true)
      setIsInitialized(false)
      fetchData({ 
        tableId,
        ...opts,
        offset: "" 
      })
    },
    hasMore,
    loadMore,
    resetRecords
  }
}

