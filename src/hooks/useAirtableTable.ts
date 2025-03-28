import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useCreateRecordMutation,
  useDeleteRecordMutation,
  useGetRecordByIdQuery,
  useQueryTableQuery,
  useUpdateRecordMutation
} from '../libs/service/airtable/generalService';

import type {
  AirtableRecord,
  FilterCondition,
  SortCondition
} from '../types/airtableTypes';


// Interface for table hook options
export interface TableQueryOptions {
  filters?: FilterCondition[];
  sort?: SortCondition[];
  limit?: number;
  offset?: string;
  view?: string;
}

// Interface for table hook results
export interface TableQueryResult<T> {
  records: Partial<T>[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch: () => void;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  resetRecords: (opts: TableQueryOptions) => void;
}

// Interface for single record hook results
export interface SingleRecordResult<T> {
  record?: Partial<T>;
  isLoading: boolean;
  isError: boolean;
  error: any;
}

// Interface for record mutation hooks
export interface MutationHookResult<T> {
  mutate: (data: Partial<T>) => Promise<Partial<T>>;
  isLoading: boolean;
  isError: boolean;
  error: any;
}

// Interface for record update mutation hooks
export interface UpdateMutationHookResult<T> {
  mutate: (id: string, data: Partial<T>) => Promise<Partial<T>>;
  isLoading: boolean;
  isError: boolean;
  error: any;
}

// Interface for record delete mutation hooks
export interface DeleteMutationHookResult {
  mutate: (id: string) => Promise<boolean>;
  isLoading: boolean;
  isError: boolean;
  error: any;
}

/**
 * Creates a set of hooks for interacting with an Airtable table
 * @param tableId The Airtable table ID to create hooks for
 * @returns Object containing hooks for query, get by ID, create, update, and delete operations
 */
export function createTableHooks<T>(tableId: string) {
  // Convert AirtableRecord to typed record
  const convertToTypedRecord = (record: AirtableRecord): Partial<T> => ({
    id: record.id,
    ...record.fields,
    createdTime: record.createdTime
  } as unknown as Partial<T>);

  /**
   * Custom hook to fetch and manage table data
   * @param options Query options including filters, sort, pagination
   * @returns Object containing records data and status
   */
  const useTable = (opts: TableQueryOptions = {}): TableQueryResult<T> => {
    const [options, setOptions] = useState<TableQueryOptions>(opts); 
    const [allRecords, setAllRecords] = useState<Partial<T>[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [needLoadMore, setNeedLoadMore] = useState(true);
 
    const queryParams= useMemo(() => {
      console.log('queryParams', tableId,options);
      return {
      tableId,
        ...options,
      }
    }, [needLoadMore]);
    const result = useQueryTableQuery(queryParams, {
      skip: !tableId
    });
    const { data, isLoading, isError, error, refetch } = result
    useEffect(() => {
      console.log('opts in useTable',opts);
    }, [opts]);
    useEffect(() => {
      console.log('resutl in useTable', tableId,result);
    }, [result]);

    // Handle initial data load
    useEffect(() => { 
      if (needLoadMore && data) {
        if (data.offset !== options.offset) {
          setAllRecords(prevRecords => [...prevRecords, ...data.records.map(convertToTypedRecord)]);
          setHasMore(!!data.offset);
          setOptions({...options, offset: data.offset});
          setNeedLoadMore(false);
          setIsLoadingMore(false);
        }
      }
    }, [data, needLoadMore]);

    const resetRecords = useCallback((resetOptions: TableQueryOptions) => {
      console.log('resetRecords',resetOptions); 
      setAllRecords([]);
      setOptions(resetOptions);
      // refetch();
      setHasMore(true);
      setNeedLoadMore(true);
    }, [options]);

    // Function to load more records
    const loadMore = useCallback(async () => {
      if (!hasMore || isLoadingMore) return;
      
      setIsLoadingMore(true);
      setNeedLoadMore(true);
    }, [hasMore, isLoadingMore,  refetch]);
    
    return {
      records: allRecords || [],
      isLoading: isLoading || isLoadingMore,
      isError,
      error,
      refetch,
      hasMore,
      loadMore, 
      resetRecords
    };
  };

  /**
   * Hook to fetch a single record by ID
   * @param id The record ID to fetch
   * @returns Object containing the record data and status
   */
  const useRecordById = (id: string): SingleRecordResult<T> => {
    const { data, isLoading, isError, error } = useGetRecordByIdQuery({
      tableId,
      recordId: id,
    }, { skip: !id });
    
    const record = data ? convertToTypedRecord(data) : undefined;
    
    return {
      record,
      isLoading,
      isError,
      error,
    };
  };

  /**
   * Hook to create a new record
   * @returns Object containing create function and status
   */
  const useCreateRecord = (): MutationHookResult<T> => {
    const [createRecord, { isLoading, isError, error }] = useCreateRecordMutation();
    
    const mutate = async (data: Partial<T>) => {
      try {
        const result = await createRecord({
          tableId,
          fields: data
        }).unwrap();
        return convertToTypedRecord(result);
      } catch (err) {
        console.error(`Failed to create ${tableId} record:`, err);
        throw err;
      }
    };
    
    return {
      mutate,
      isLoading,
      isError,
      error
    };
  };

  /**
   * Hook to update an existing record
   * @returns Object containing update function and status
   */
  const useUpdateRecord = (): UpdateMutationHookResult<T> => {
    const [updateRecord, { isLoading, isError, error }] = useUpdateRecordMutation();
    
    const mutate = async (id: string, data: Partial<T>) => {
      try {
        const result = await updateRecord({
          tableId,
          recordId: id,
          fields: data
        }).unwrap();
        return convertToTypedRecord(result);
      } catch (err) {
        console.error(`Failed to update ${tableId} record:`, err);
        throw err;
      }
    };
    
    return {
      mutate,
      isLoading,
      isError,
      error
    };
  };

  /**
   * Hook to delete a record
   * @returns Object containing delete function and status
   */
  const useDeleteRecord = (): DeleteMutationHookResult => {
    const [deleteRecord, { isLoading, isError, error }] = useDeleteRecordMutation();
    
    const mutate = async (id: string) => {
      try {
        await deleteRecord({
          tableId,
          recordId: id
        }).unwrap();
        return true;
      } catch (err) {
        console.error(`Failed to delete ${tableId} record:`, err);
        throw err;
      }
    };
    
    return {
      mutate,
      isLoading,
      isError,
      error
    };
  };

  // Return all the hooks for this table
  return {
    useTable,
    useRecordById,
    useCreateRecord,
    useUpdateRecord,
    useDeleteRecord
  };
} 