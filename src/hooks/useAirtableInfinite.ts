"use client"

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryTableQuery } from 'src/libs/service/airtable/generalService';
import type { AirtableRecord, QueryOptions } from 'src/types/airtableTypes';

// Interface for table hook results
interface TableQueryResult<T> {
  records: Partial<T>[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch: () => void;
  hasMore: boolean;
  loadMore: () => void;
  resetRecords: () => void;
  currentOffset: string;
}

  // Convert AirtableRecord to typed record
  const convertToTypedRecord = <T>(record: AirtableRecord): Partial<T> => ({
    id: record.id,
    ...record.fields,
    createdTime: record.createdTime
  } as unknown as Partial<T>)

export const useAirtableInfinite = <T>(
  tableId: string,
  opts: Omit<QueryOptions, 'tableId'> = {},
  isSkip: boolean = false
): TableQueryResult<T> => {
  // Store records by offset
  const [recordsByOffset, setRecordsByOffset] = useState<Record<string, Partial<T>[]>>({});
  const [currentOffset, setCurrentOffset] = useState<string>('');
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Memoize query options to avoid unnecessary fetches
  const queryOptions = useMemo(() => ({
    tableId,
    ...opts,
    offset: currentOffset || undefined,
  }), [tableId, opts, currentOffset]);

  // Use the eager query hook
  const { data, isLoading, isFetching, isError, error, refetch } = useQueryTableQuery(queryOptions, {skip: isSkip});

  // Merge new data into recordsByOffset when data or offset changes
  useEffect(() => {
    if (data?.records) {
      setRecordsByOffset(prev => {
        const key = currentOffset || 'start';
        return {
          ...prev,
          [key]: data.records.map(convertToTypedRecord<T>),
        };
      });
      setHasMore(!!data.offset);
      setIsResetting(false); // Data arrived, done resetting/loading
    }
  }, [data, currentOffset]);

  // Function to load more (fetch next page)
  const loadMore = useCallback(() => {
    if (data?.offset) {
      setCurrentOffset(data.offset);
    }
  }, [data]);

  // Function to reset (e.g., when filters change)
  const resetRecords = useCallback(() => {
    setRecordsByOffset({});
    setCurrentOffset('');
    setHasMore(true);
    setIsResetting(true); // Set local loading state
  }, []);

  // Merge all records from all offsets in order
  const allRecords = useMemo(() => {
    // Sort keys to maintain order: 'start' first, then by offset string order
    const keys = Object.keys(recordsByOffset).sort((a, b) => {
      if (a === 'start') return -1;
      if (b === 'start') return 1;
      return a.localeCompare(b);
    });
    // Flatten arrays, deduplicate by id
    const seen = new Set();
    const merged: Partial<T>[] = [];
    keys.forEach(key => {
      (recordsByOffset[key] || []).forEach(rec => {
        // @ts-ignore
        if (rec.id && !seen.has(rec.id)) {
          // @ts-ignore]
          seen.add(rec.id);
          merged.push(rec);
        }
      });
    });
    return merged;
  }, [recordsByOffset]);

  return {
    records: allRecords,
    isLoading: isLoading ||isFetching|| isResetting, // Use combined loading state
    isError,
    error,
    refetch,
    hasMore,
    loadMore,
    resetRecords,
    currentOffset,
  };
};

