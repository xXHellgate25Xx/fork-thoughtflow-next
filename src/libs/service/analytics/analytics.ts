import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQuery } from "../supabase/baseQuery";


interface ChannelAnalyticsReq {
  channel_id: string;
  type_of_agg: string; 
  current_date: string | Date
}

interface PillarAnalyticsReq {
  pillar_id: string | undefined;
  type_of_agg: string; 
  current_date: string | Date
}

interface ChannelStatsByCriteriaReq {
  channel_id: string;
  start_date: string | Date;
  end_date: string | Date;
}

interface AnalyticsRes {
  data?: any;
  error?: any
}

const AnalyticsPageApi = createApi({
  reducerPath: "analyticsPageApi",
  baseQuery,
  endpoints: (builder) => ({
    
    // ------------------GET ALL STATS OF USER--------------------------
    getAllStatsOfUser: builder.query<any, ChannelAnalyticsReq>({
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
    // ------------------GET ALL STATS OF USER BY PILLAR--------------------------
    getAllStatsOfUserByPillar: builder.query<any, PillarAnalyticsReq>({
      query: ({ pillar_id, type_of_agg, current_date }) => ({
        url: `/functions/v1/api/analytics/pillar_analytics/${pillar_id}/${type_of_agg}/${current_date}`,
        method: 'GET'
      }),
    }),
    // ------------------GET CHANNEL STATISTICS OF USER BY PAGE--------------------------
    getChannelStatsOfUserByPage: builder.query<AnalyticsRes, ChannelStatsByCriteriaReq>({
      query: ({channel_id, start_date, end_date}) => ({
        url: `/functions/v1/api/analytics/channel/${channel_id}/page`,
        params: {start_date, end_date},
        method: 'GET'
      }),
    }),
    // ------------------GET CHANNEL STATISTICS OF USER BY PILLAR--------------------------
    getChannelStatsOfUserByPillar: builder.query<AnalyticsRes, ChannelStatsByCriteriaReq>({
      query: ({channel_id, start_date, end_date}) => ({
        url: `/functions/v1/api/analytics/channel/${channel_id}/pillar`,
        params: {start_date, end_date},
        method: 'GET'
      }),
    }),
    // ------------------GET ALL STATS OF USER--------------------------
    getTopContent: builder.query<any, void>({
      query: () => ({        
          url: `/functions/v1/api/analytics/top-content`,
          method: 'GET'
      }),
    }),
    // ------------------GET ALL STATS OF USER--------------------------
    getTopContentWeekly: builder.query<any, void>({
      query: () => ({        
          url: `/functions/v1/api/analytics/top-content/week`,
          method: 'GET'
      }),
    }),
    // ------------------GET ALL STATS OF USER--------------------------
    getTopContentDaily: builder.query<any, void>({
      query: () => ({        
          url: `/functions/v1/api/analytics/top-content/day`,
          method: 'GET'
      }),
    }),
  })
});

export const {
  useGetAllStatsOfUserQuery,
  useGetAnalyticsViewByContentPillarQuery,
  useGetAllStatsOfUserByPillarQuery,
  useGetChannelStatsOfUserByPageQuery,
  useGetChannelStatsOfUserByPillarQuery,
  useGetTopContentQuery,
  useGetTopContentWeeklyQuery,
  useGetTopContentDailyQuery,
} = AnalyticsPageApi;

export {AnalyticsPageApi};