import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../supabase/baseQuery';

interface ChannelReq {
  channel_id?: string;
  pillar_id?: string;
  payload?: {
    name: string;
    channel_type: string;
    url?: string;
    is_active?: boolean;
    wix_account_id?: string;
    wix_site_id?: string;
    encrypted_wix_api_key?: string;
    brand_voice_initial?: string;
    brand_voice_feedback?: string;
    prompt?: string; // Add prompt field for creating a channel with pillar association

    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    refresh_token_expires_in?: number;
  };
}

interface ChannelRes {
  data?: any;
  error?: any;
  count?: number;
  status?: number;
  statusText?: string;
}

// Channel data interface
export interface ChannelData {
  id: string;
  name: string;
  type: string;
  url: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  n_published?: number;
  n_draft?: number;
  views?: number;
  pillar_id?: string;
  user_id?: string;
  account_id?: string;
  is_private?: boolean;
  channel_type?: string;
  integration_id?: string;
  brand_voice_initial?: string;
  brand_voice_feedback?: string;
  pending_connection?: boolean; // Flag for channels that need connection
  prompt?: string; // Add prompt field to match the API response 
  association_id?: string; // ID of the pillar-channel association
}

// PillarChannel data interface for the new format
export interface PillarChannelData {
  id: string;
  pillar_id: string;
  prompt: string;
  channel: ChannelData;
}

// Interface for updating pillar-channel association
interface PillarChannelUpdateReq {
  channel_id: string;
  pillar_id: string;
  prompt?: string;
  payload?: {
    id: string;
    name: string;
    is_active: boolean;
    url?: string;
    brand_voice_initial?: string;
    brand_voice_feedback?: string;
    association_id?: string; // Add association_id field
  };
}

// Interface for associating a channel with a pillar
interface AssociatePillarChannelReq {
  pillar_id: string;
  channel_id: string;
  prompt: string;
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
  tagTypes: ['Channel', 'PillarChannel'],
  keepUnusedDataFor: 300, // Keep unused data for 5 minutes
  endpoints: (builder) => ({
    // ------------------GET ALL CHANNELS OF USER--------------------------
    getAllChannelsOfUser: builder.query<ChannelRes, void>({
      query: () => ({
        url: `/functions/v1/api/channel`,
        method: 'GET',
      }),
      providesTags: (result) => 
        result?.data
          ? [
              ...result.data.map((channel: { id: string }) => ({ type: 'Channel' as const, id: channel.id })),
              { type: 'Channel', id: 'LIST' },
            ]
          : [{ type: 'Channel', id: 'LIST' }],
    }),
    // ------------------GET CHANNEL COUNT BY PILLAR ID--------------------------
    getPillarChannelCount: builder.query<ChannelRes, { pillar_id: string }>({
      query: ({ pillar_id }) => ({
        url: `/functions/v1/api/channel/pillar_count_channels/${pillar_id}`,
        method: 'GET',
      }),
    }),
    // ------------------GET CHANNELS BY PILLAR ID--------------------------
    getChannelsByPillarId: builder.query<ChannelRes, ChannelReq>({
      query: (channel_req) => ({
        url: `/functions/v1/api/pillar-channels/pillar/${channel_req.pillar_id}`,
        method: 'GET',
      }),
      providesTags: (result) => 
        result?.data
          ? [
              ...result.data.map((channel: { id: string }) => ({ type: 'Channel' as const, id: channel.id })),
              { type: 'PillarChannel' as const, id: result.data[0]?.pillar_id || 'LIST' },
            ]
          : [{ type: 'PillarChannel', id: 'LIST' }],
      transformResponse: (response: ChannelRes) => {
        // Transform the nested channel structure to the format expected by the UI
        console.log('Raw API response from pillar-channels endpoint:', response);
        
        // Handle case where response data is an array of direct channel objects
        if (response.data && Array.isArray(response.data)) {
          // Check the first item to determine the format
          const firstItem = response.data[0];
          
          // If it's already in the expected format with a direct channel object (not nested)
          if (firstItem && firstItem.channel_type !== undefined) {
            console.log('Response already in expected format, minimal transformation needed');
            const mappedData = response.data.map((channel) => ({
              id: channel.id,
              name: channel.name,
              type: channel.channel_type || '',
              url: channel.url || '',
              is_active: channel.is_active,
              n_published: channel.n_published || 0,
              n_draft: channel.n_draft || 0,
              views: channel.views || 0,
              pillar_id: channel.pillar_id,
              user_id: channel.user_id,
              account_id: channel.account_id,
              created_at: channel.created_at || new Date().toISOString(),
              updated_at: channel.updated_at || new Date().toISOString(),
              prompt: channel.prompt,
              brand_voice_initial: channel.brand_voice_initial,
              brand_voice_feedback: channel.brand_voice_feedback
            }));
            
            console.log('Mapped channel data:', mappedData);
            return { ...response, data: mappedData };
          }
          
          // Handle the nested pillar-channel association structure with is_active at the association level
          const transformedData = response.data.map((item: any) => {
            // If channel is null, create a placeholder with the prompt information
            if (!item.channel) {
              return {
                id: item.id, // Use the pillar-channel association ID
                association_id: item.id, // Store the association ID separately
                name: item.prompt, // Use the prompt as the name
                type: 'unknown',
                url: '',
                is_active: item.is_active, // Use is_active from the association
                n_published: 0,
                n_draft: 0,
                views: 0,
                pillar_id: item.pillar_id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                prompt: item.prompt,
                pending_connection: true // Add a flag to indicate this needs connection
              };
            }
            
            // Regular channel mapping
            return {
              id: item.channel.id,
              association_id: item.id, // Store the association ID separately
              name: item.channel.name,
              type: item.channel.channel_type || '',
              url: item.channel.url || '',
              is_active: item.is_active, // Use is_active from the association level, not from channel
              n_published: item.channel.n_published || 0,
              n_draft: item.channel.n_draft || 0, 
              views: item.channel.views || 0,
              pillar_id: item.pillar_id,
              user_id: item.channel.user_id,
              account_id: item.channel.account_id,
              created_at: item.channel.created_at || new Date().toISOString(),
              updated_at: item.channel.updated_at || new Date().toISOString(),
              prompt: item.prompt,
              brand_voice_initial: item.channel.brand_voice_initial,
              brand_voice_feedback: item.channel.brand_voice_feedback
            };
          });
          
          console.log('Transformed channel data:', transformedData);
          return { ...response, data: transformedData };
        }
        
        // If the response format is different than expected, log and return as is
        console.log('Unexpected response format, returning as is');
        return response;
      },
    }),
    // ------------------GET CHANNEL BY CHANNEL_ID-------------------------
    getChannelByID: builder.query<ChannelRes, ChannelReq>({
      query: (channel_req) => ({
        url: `/functions/v1/api/channel/${channel_req.channel_id}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Channel', id: arg.channel_id }],
    }),
    // -----------------CREATE NEW CHANNEL-------------------
    createChannel: builder.mutation<ChannelRes, ChannelReq>({
      query: ({ payload, pillar_id }) => {
        // Make a shallow copy of the payload to avoid modifying the original
        const processedPayload = { ...payload };
        
        // Extract any fields that shouldn't be in the body
        const prompt = processedPayload?.prompt;
        delete processedPayload?.prompt;
        
        // Process special fields like Wix integration fields
        if (processedPayload?.channel_type === 'wix' && 
          (processedPayload.wix_account_id || 
           processedPayload.wix_site_id || 
           processedPayload.encrypted_wix_api_key)) {
          return {
            url: `/functions/v1/api/channel`,
            method: 'POST',
            body: transformWixKeys(processedPayload),
          };
        }
        
        // If there's a pillar_id and prompt, we'll create a channel with pillar association
        if (pillar_id && prompt) {
          return {
            url: `/functions/v1/api/pillar-channels/new-channel`,
            method: 'POST',
            body: {
              ...processedPayload,
              pillar_id,
              prompt
            },
          };
        }
        
        // Regular channel creation
        return {
          url: `/functions/v1/api/channel`,
          method: 'POST',
          body: processedPayload,
        };
      },
      // Transform the response to match the expected format
      transformResponse: (response: any) => {
        // Handle the new API response format which has data and association objects
        if (response.data && response.association) {
          // Merge the channel data with the association information
          const transformedData = {
            ...response.data,
            pillar_id: response.association.pillar_id,
            prompt: response.association.prompt
          };
          
          return { data: transformedData };
        }
        
        // Return the original response if it doesn't match the new format
        return response;
      },
      invalidatesTags: [{ type: 'Channel', id: 'LIST' }, { type: 'PillarChannel', id: 'LIST' }]
    }),
    // -----------------MODIFY AN EXISTING CHANNEL-------------------
    modifyChannel: builder.mutation<ChannelRes, ChannelReq>({
      query: ({ channel_id, payload }) => ({
        url: `/functions/v1/api/channel/${channel_id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Channel', id: arg.channel_id },
        { type: 'PillarChannel', id: 'LIST' }
      ]
    }),
    // -----------------UPDATE PILLAR-CHANNEL ASSOCIATION WITH PROMPT-------------------
    updatePillarChannelPrompt: builder.mutation<ChannelRes, PillarChannelUpdateReq>({
      query: ({ pillar_id, channel_id, prompt, payload }) => {
        // Check if we have an association_id directly in the payload
        const associationId = (payload as any)?.association_id || channel_id;
        
        // Create a copy of the payload to possibly modify it
        const requestBody: any = {
          prompt,
          is_active: payload?.is_active,
        };
        
        // If name is provided, include it in the top level of the request body
        if (payload?.name) {
          requestBody.name = payload.name;
        }
        
        console.log('Sending pillar-channel update with body:', requestBody);
        
        return {
          // Use the association ID for the endpoint URL
          url: `/functions/v1/api/pillar-channels/${associationId}`,
          method: 'PUT',
          body: requestBody,
        };
      },
      invalidatesTags: (result, error, arg) => [
        { type: 'Channel', id: arg.channel_id },
        { type: 'PillarChannel', id: arg.pillar_id }
      ]
    }),
    // -----------------ASSOCIATE EXISTING CHANNEL WITH PILLAR-------------------
    associatePillarChannel: builder.mutation<ChannelRes, AssociatePillarChannelReq>({
      query: ({ pillar_id, channel_id, prompt }) => ({
        url: `/functions/v1/api/pillar-channels/existing-channel`,
        method: 'POST',
        body: {
          pillar_id,
          channel_id,
          prompt
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Channel', id: arg.channel_id },
        { type: 'PillarChannel', id: arg.pillar_id },
        { type: 'PillarChannel', id: 'LIST' }
      ]
    }),
    // -----------------DELETE PILLAR-CHANNEL ASSOCIATION-------------------
    deletePillarChannel: builder.mutation<ChannelRes, string>({
      query: (association_id) => ({
        url: `/functions/v1/api/pillar-channels/${association_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Channel', id: 'LIST' }, { type: 'PillarChannel', id: 'LIST' }]
    }),
  }),
});

export const { 
    useGetAllChannelsOfUserQuery,
    useGetChannelsByPillarIdQuery,
    useGetChannelByIDQuery,
    useCreateChannelMutation, 
    useModifyChannelMutation,
    useGetPillarChannelCountQuery,
    useUpdatePillarChannelPromptMutation,
    useAssociatePillarChannelMutation,
    useDeletePillarChannelMutation
} = ChannelApi;
export { ChannelApi };
