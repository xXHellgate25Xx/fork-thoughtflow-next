import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../supabase/baseQuery';

interface ChannelReq {
  channel_id?: string;
  payload?: {
    name: string;
    channel_type: string;
    url?: string;
    is_active?: boolean;
    wix_account_id?: string;
    wix_site_id?: string;
    brand_voice_initial?: string;
    account_id?: string | null;
  };
}

interface ChannelRes {
  data?: any;
  error?: any;
}

const ChannelApi = createApi({
  reducerPath: 'channelApi',
  baseQuery,
  endpoints: (builder) => ({
    // ------------------GET ALL CHANNELS OF USER--------------------------
    getAllChannelsOfUser: builder.query<ChannelRes, void>({
      query: () => ({
        url: `/functions/v1/api/channel`,
        method: 'GET',
      }),
    }),
    // ------------------GET CHANNEL BY CHANNEL_ID-------------------------
    getChannelByID: builder.query<ChannelRes, ChannelReq>({
      query: (channel_req) => ({
        url: `/functions/v1/api/channel/${channel_req.channel_id}`,
        method: 'GET',
      }),
    }),
    // -----------------CREATE NEW CHANNEL-------------------
    createChannel: builder.mutation<ChannelRes, ChannelReq>({
      query: ({ payload }) => ({
        url: `/functions/v1/api/channel`,
        method: 'POST',
        body: payload,
      }),
    }),
    // -----------------MODIFY AN EXISTING CHANNEL-------------------
    modifyChannel: builder.mutation<ChannelRes, ChannelReq>({
      query: ({ channel_id, payload }) => ({
        url: `/functions/v1/api/channel/${channel_id}`,
        method: 'PUT',
        body: payload,
      }),
    }),
  }),
});

export const { 
    useGetAllChannelsOfUserQuery,
    useGetChannelByIDQuery,
    useCreateChannelMutation, 
    useModifyChannelMutation 
} = ChannelApi;
export { ChannelApi };
