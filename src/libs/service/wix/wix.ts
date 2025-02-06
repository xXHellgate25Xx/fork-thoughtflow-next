import { RichContent } from 'ricos-schema';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../supabase/baseQuery';

// Define the file response interface
export interface FileResponse {
  id: string;
  displayName: string;
  url: string;
  parentFolderId: string;
  hash: string;
  sizeInBytes: string;
  private: boolean;
  mediaType: string;
  media: any;
  operationStatus: string;
  sourceUrl: string;
  thumbnailUrl: string;
  labels: string[];
  createdDate: string;
  updatedDate: string;
  state: string;
}


export interface WixUploadRequest {
  file: string; 
  bucketName: string; 
  destinationPath: string; 
  displayName: string; 
  contentType: string; 
}

export interface WixDraftPostResponse {
  data? :{
  title: string;
  excerpt: string;
  featured: boolean;
  catetegoryId: string[];
  memberId: string;
  status: string;
  richContent: RichContent;
  }[];
  error?: any;
}

export interface WixCreatePublishPostRequest {
  title: string;
  richContent: RichContent;
  content_id?: string;
  draftPostId?: string;
}


export const WixApi = createApi({
  reducerPath: 'supabaseApi',
  baseQuery,
  endpoints: (builder) => ({
    uploadToWix: builder.mutation<{ file: FileResponse }, {channelId: string ; fileData: WixUploadRequest}>({
      query: ({channelId, fileData}) => ({
        url: `functions/v1/api/upload-file/${channelId}/upload-image`,
        method: 'POST',
        body: {
          file: fileData.file,
          bucketName: fileData.bucketName,
          destinationPath: fileData.destinationPath,
          displayName: fileData.displayName,
          contentType: fileData.contentType,
        },
      }),
    }),
    CreatePublishToWix: builder.mutation<WixDraftPostResponse, { channel_id: string; CreatePublishReq: WixCreatePublishPostRequest }>({
      query: ({ channel_id, CreatePublishReq }) => ({
        url: `functions/v1/api/post/${channel_id}/create-publish`,
        method: 'POST',
        body: CreatePublishReq,
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const { 
  useUploadToWixMutation,
  useCreatePublishToWixMutation,
} = WixApi;
