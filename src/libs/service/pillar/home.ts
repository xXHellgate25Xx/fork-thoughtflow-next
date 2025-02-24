import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../supabase/baseQuery";

interface Pillar {
  id: string;
  name: string;
  created_at: Date;
  is_active: boolean;
  user_id: string;
  description: string;
  primary_keyword: string;
  n_published: number;
  n_draft: number;
  content_views: number;
}

interface ApiResponse {
  data?: Pillar[];
  error?: any;
  message?: string;
}

interface CreatePillarReq {
  pillar_name: string;
  description: string;
  keyword: string
}

interface CreatePillarRes {
  data?: any;
  error?: any;
  message?: string;
}

const HomePageApi = createApi({
  reducerPath: "homepageApi",
  baseQuery,
  endpoints: (builder) => ({
    // ------------------LIST ALL PILLARS--------------------------
    getAllPillar: builder.query<ApiResponse, void>({
      query: () => ({        
          url: `/functions/v1/api/content-pillars`,
          method: 'GET'
      }),
    }),
    createPillar: builder.mutation<CreatePillarRes, CreatePillarReq>({
      query: ({ pillar_name, description, keyword }) => ({        
        url: `/functions/v1/api/content-pillars`,
        method: 'POST',
        body: {
          name : pillar_name,
          description,
          primary_keyword: keyword,
        }
      }),
    }),
  }),
});

export const {
  useGetAllPillarQuery,
  useCreatePillarMutation
} = HomePageApi;
export { HomePageApi };