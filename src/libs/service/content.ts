import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./supabase/baseQuery";

export interface ContentApiRes{
    content_id: string;
    title: string;
    pillar_id: string;
    pillar: string;
    status: string;
    pageviews: number;
    last_modified: string;
}

export interface AnalyticsApiRes{
  user_id: string,
  published: number,
  archived: number,
  draft: number,
}

interface getAllContentsOfUserRes {
    data: ContentApiRes[];
    error?: string;
}

interface getAllStatsOfUserRes {
  data: AnalyticsApiRes[];
  error?: string;
}

const ContentPageApi = createApi({
    reducerPath: "contentPageApi",
    baseQuery,
    endpoints: (builder) => ({
      // ------------------GET ALL CONTENTS OF USER--------------------------
      getAllContentsOfUser: builder.query<getAllContentsOfUserRes, void>({
          query: () => ({        
              url: `/functions/v1/api/content/`,
              method: 'GET'
          }),
      }),
      // ------------------GET ALL STATS OF USER--------------------------
      getAllStatsOfUser: builder.query<getAllStatsOfUserRes, void>({
        query: () => ({        
            url: `/functions/v1/api/analytics/user`,
            method: 'GET'
        }),
      }),
    })
});
  
  export const {
    useGetAllContentsOfUserQuery,
    useGetAllStatsOfUserQuery
  } = ContentPageApi;
  export { ContentPageApi };
  