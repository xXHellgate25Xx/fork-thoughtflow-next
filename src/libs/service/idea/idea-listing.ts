import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../supabase/baseQuery";

export interface IdeaItem {
  account_id: string;
  text: string;
  title: string;
  is_deleted: boolean;
  pillar_id: string;
  pillar: string;
  page_view: number;
  channels: number;
  created_at: string;
}
export interface Pagination{
  page: number;
  page_size: number;
  total: number;
}
interface GetIdeasResponse {
  data: IdeaItem[];
  pagination: Pagination;
  error: string | null;
  count?: number | null;
  status?: number;
  statusText?: string;
}

interface GetTotalIdeasResponse {
  error: string | null;
  data: null;
  count: number;
  status: number;
  statusText: string;
}

interface GetIdeasRequest {
  page: number;
  page_size: number;
  pillar_id?: string;
  time_range?: string;
}

interface GetTotalIdeasRequest {
  pillar_id?: string;
  time_range?: string;
}

const IdeaListingApi = createApi({
  reducerPath: "ideaListing",
  baseQuery,
  tagTypes: ['Ideas'],
  endpoints: (builder) => ({
    // Get list of ideas with pillar information with pagination
    getIdeasByPillar: builder.query<GetIdeasResponse, GetIdeasRequest>({
      query: (params) => {
        // Build query string from params
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        return {
          url: `/functions/v1/api/idea/?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Ideas']
    }),
    // Get total count of ideas
    getTotalIdeas: builder.query<GetTotalIdeasResponse, void>({
      query: () => ({
        url: `/functions/v1/api/idea/count`,
        method: 'GET',
      }),
      providesTags: ['Ideas']
    }),
  })
});

export const {
  useGetIdeasByPillarQuery,
  useGetTotalIdeasQuery,
} = IdeaListingApi;

export { IdeaListingApi };

