import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../supabase/baseQuery";

const AnalyticsPageApi = createApi({
    reducerPath: "analyticsPageApi",
    baseQuery,
    endpoints: (builder) => ({
      // ------------------GET ALL CHANNELS OF USER--------------------------
      getAllChannelsOfUser: builder.query<any, void>({
        query: () => ({        
            url: `/functions/v1/api/channel`,
            method: 'GET'
        }),
      }),
      // ------------------GET ALL STATS OF USER--------------------------
      getAllStatsOfUser: builder.query<any, any>({
          query: ({ channel_id, type_of_agg, current_date }) => ({        
              url: `/functions/v1/api/analytics/channel_analytics/${channel_id}/${type_of_agg}/${current_date}`,
              method: 'GET'
          }),
      }),
      // ------------------GET ANALYTICS VIEW BY CONTENT PILLAR--------------------------
      getAnalyticsViewByContentPillar: builder.query<any, void>({
        query: () => ({        
            url: `/functions/v1/api/analytics/pillar-views`,
            method: 'GET'
        }),
    }),      
    })
});
  
  export const {
    useGetAllChannelsOfUserQuery,
    useGetAllStatsOfUserQuery,
    useGetAnalyticsViewByContentPillarQuery,
  } = AnalyticsPageApi;
  export { AnalyticsPageApi };
  