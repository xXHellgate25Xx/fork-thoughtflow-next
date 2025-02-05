import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../supabase/baseQuery";

interface Pillar {
  id: string;
  name: string;
  created_at: Date;
  is_active: boolean;
  user_id: string;
}

interface ApiResponse {
  data?: Pillar[];
  error?: any;
  message?: string;
}

interface CreatePillarReq {
    pillar_name: string;
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
        query: ({ pillar_name }) => ({        
            url: `/functions/v1/api/content-pillars`,
            method: 'POST',
            body: {
                name : pillar_name
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