import { useEffect, useState } from 'react';
import {
  useCreateRecordMutation,
  useDeleteRecordMutation,
  useGetRecordByIdQuery,
  useLazyQueryTableQuery,
  useUpdateRecordMutation
} from '../libs/service/airtable/generalService';
import { useAirtableInfinite } from './useAirtableInfinite';

import type {
  AirtableRecord,
  QueryOptions
} from '../types/airtableTypes';


// Interface for table hook results
export interface TableQueryResult<T> {
  records: Partial<T>[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch: () => void;
  hasMore: boolean;
  loadMore: () => void;
  resetRecords: ( ) => void;
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

// Interface for manual table query results
export interface ManualTableQueryResult<T> {
  records: Partial<T>[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  query: (options?: Omit<QueryOptions, 'tableId'>) => Promise<Partial<T>[]>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  resetRecords: () => void;
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
  const useTable = (opts: Omit<QueryOptions, 'tableId'> = {}): TableQueryResult<T> =>useAirtableInfinite<T>(tableId, opts);

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

  /**
   * Custom hook for manual table querying with sort and filters
   * @param initialOptions Initial query options including filters and sort
   * @returns Object containing query function and data state
   */
  const useManualTable = (initialOptions: Omit<QueryOptions, 'tableId'> = {}): ManualTableQueryResult<T> => {
    const [allRecords, setAllRecords] = useState<Partial<T>[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [options, setOptions] = useState<Omit<QueryOptions, 'tableId'>>(initialOptions);
    
    const [fetchData, { isLoading, isError, error }] = useLazyQueryTableQuery();

    const query = async (newOptions?: Omit<QueryOptions, 'tableId'>) : Promise<Partial<T>[]> => {
      try {
        setAllRecords([]);
        setHasMore(false);
        
        const queryOptions = newOptions || options;
        setOptions(queryOptions);

        const response = await fetchData({ 
          ...queryOptions,
          tableId,
          offset: "" 
        }).unwrap();

        const newRecords = response?.records ? response.records.map(convertToTypedRecord) : [];
        setAllRecords(newRecords);
        setHasMore(!!response?.offset);
        setOptions(prev => ({ ...prev, offset: response?.offset || "" }));
        
        return newRecords;
      } catch (err) {
        console.error(`Failed to query ${tableId} records:`, err);
        throw err;
      }
    }

    const resetRecords = () => {
      setAllRecords([]);
      setHasMore(false);
      setOptions(initialOptions);
    };

    const loadMore = async () => {
      if (!hasMore) return;
      await query(options);
    };

    return {
      records: allRecords,
      isLoading,
      isError,
      error,
      query,
      hasMore,
      loadMore,
      resetRecords
    };
  };

  // Hook to fetch all records from a table, handling offset pagination automatically
  const useAllAirtableRecords = (opts: Omit<QueryOptions, 'tableId' | 'limit'> = {}, batchSize = 1000, isSkip: boolean = false) => {
    const {
      records,
      isLoading,
      isError,
      error,
      hasMore,
      loadMore,
      refetch,
      resetRecords,
      currentOffset,
    } = useAirtableInfinite<T>(tableId, { ...opts, limit: batchSize }, isSkip);

    // Automatically load all data
    useEffect(() => {
      if (!isSkip && hasMore && !isLoading) {
        loadMore();
      }
    }, [hasMore, isLoading, loadMore]);

    // Reset records if tableId or opts change
    useEffect(() => {
      resetRecords();
    }, [tableId, JSON.stringify(opts)]);

    return {
      records,
      isLoading: isLoading && !isSkip,
      isError: isError && !isSkip,
      error,
      refetch,
      hasMore,
    };
  };

  // Return all the hooks for this table
  return {
    useTable,
    useManualTable,
    useRecordById,
    useCreateRecord,
    useUpdateRecord,
    useDeleteRecord,
    useAllAirtableRecords
  };
} 