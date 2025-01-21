import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./supabase/baseQuery";

interface Pillar {
  id: string;
  name: string;
}

interface ApiResponse {
  data?: Pillar[];
  error?: any;
  message?: string;
}

interface CreatePillarReq {
    pillar_name: string;
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
    })
  }),
});

export const {
  useGetAllPillarQuery
} = HomePageApi;
export { HomePageApi };