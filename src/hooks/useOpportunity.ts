import {
  useCreateRecordMutation,
  useDeleteRecordMutation,
  useGetRecordByIdQuery,
  useQueryTableQuery,
  useUpdateRecordMutation
} from '../libs/service/airtable/generalService';
import {
  AirtableRecord,
  FilterCondition,
  OpportunitiesRecord,
  SortCondition
} from '../types/airtableTypes';

// Table ID for Opportunities table
const OPPORTUNITIES_TABLE_ID = 'Opportunities';

interface UseOpportunityOptions {
  filters?: FilterCondition[];
  sort?: SortCondition[];
  limit?: number;
  offset?: number;
}

interface UseOpportunityResult {
  opportunities: Partial<OpportunitiesRecord>[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch: () => void;
}

/**
 * Convert AirtableRecord to OpportunitiesRecord by merging fields
 */
const convertToOpportunityRecord = (record: AirtableRecord): Partial<OpportunitiesRecord> => ({
    id: record.id,
    ...record.fields,
    createdTime: record.createdTime
  } as Partial<OpportunitiesRecord>);

/**
 * Custom hook to fetch and manage opportunities data
 * @param options Query options including filters, sort, pagination
 * @returns Object containing opportunities data and status
 */
export const useOpportunity = (options: UseOpportunityOptions = {}): UseOpportunityResult => {
  // Destructure options with defaults
  const { filters = [], sort = [], limit, offset } = options;
  
  // Setup query options
  const queryOptions = {
    tableId: OPPORTUNITIES_TABLE_ID,
    filters,
    sort,
    limit,
    offset,
  };
  
  // Use the generalService to fetch data
  const { data, isLoading, isError, error, refetch } = useQueryTableQuery(queryOptions);
  
  // Transform the generic AirtableRecord[] to typed OpportunitiesRecord[]
  const opportunities = (data || []).map(convertToOpportunityRecord);
  
  // Return the result
  return {
    opportunities,
    isLoading,
    isError,
    error,
    refetch,
  };
};

/**
 * Hook to fetch a single opportunity by ID
 * @param id The record ID to fetch
 * @returns Object containing the opportunity data and status
 */
export const useOpportunityById = (id: string) => {
  const { data, isLoading, isError, error } = useGetRecordByIdQuery({
    tableId: OPPORTUNITIES_TABLE_ID,
    recordId: id,
  });
  
  // Transform the AirtableRecord to OpportunitiesRecord
  const opportunity = data ? convertToOpportunityRecord(data) : undefined;
  
  return {
    opportunity,
    isLoading,
    isError,
    error,
  };
};

/**
 * Hook to create a new opportunity
 * @returns Object containing create function and status
 */
export const useCreateOpportunity = () => {
  const [createRecord, { isLoading, isError, error }] = useCreateRecordMutation();
  
  const createOpportunity = async (data: Partial<OpportunitiesRecord>) => {
    try {
      const result = await createRecord({
        tableId: OPPORTUNITIES_TABLE_ID,
        fields: data
      }).unwrap();
      return convertToOpportunityRecord(result);
    } catch (err) {
      console.error('Failed to create opportunity:', err);
      throw err;
    }
  };
  
  return {
    createOpportunity,
    isLoading,
    isError,
    error
  };
};

/**
 * Hook to update an existing opportunity
 * @returns Object containing update function and status
 */
export const useUpdateOpportunity = () => {
  const [updateRecord, { isLoading, isError, error }] = useUpdateRecordMutation();
  
  const updateOpportunity = async (id: string, data: Partial<OpportunitiesRecord>) => {
    try {
      const result = await updateRecord({
        tableId: OPPORTUNITIES_TABLE_ID,
        recordId: id,
        fields: data
      }).unwrap();
      return convertToOpportunityRecord(result);
    } catch (err) {
      console.error('Failed to update opportunity:', err);
      throw err;
    }
  };
  
  return {
    updateOpportunity,
    isLoading,
    isError,
    error
  };
};

/**
 * Hook to delete an opportunity
 * @returns Object containing delete function and status
 */
export const useDeleteOpportunity = () => {
  const [deleteRecord, { isLoading, isError, error }] = useDeleteRecordMutation();
  
  const deleteOpportunity = async (id: string) => {
    try {
      await deleteRecord({
        tableId: OPPORTUNITIES_TABLE_ID,
        recordId: id
      }).unwrap();
      return true;
    } catch (err) {
      console.error('Failed to delete opportunity:', err);
      throw err;
    }
  };
  
  return {
    deleteOpportunity,
    isLoading,
    isError,
    error
  };
}; 