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
    encrypted_wix_api_key?: string;
    brand_voice_initial?: string;
    account_id?: string | null;
  };
}

interface ChannelRes {
  data?: any;
  error?: any;
}

const transformWixKeys = (payload: Record<string, any>) => {
  const keyMap: Record<string, string> = {
    wix_account_id: 'wix-account-id',
    wix_site_id: 'wix-site-id',
    encrypted_wix_api_key: 'encrypted-wix-api-key',
  };

  const result: Record<string, any> = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return; // skip undefined values

    const newKey = keyMap[key] || key;
    result[newKey] = value;
  });

  return result;
};


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
      query: ({ payload }) => {
        const transformedPayload = payload ? transformWixKeys(payload) : {};
        return {
          url: `/functions/v1/api/channel`,
          method: 'POST',
          body: transformedPayload,
        };
      },
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
