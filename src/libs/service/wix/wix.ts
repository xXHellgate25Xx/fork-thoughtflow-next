import type { Tags } from 'src/interfaces/seoData-interface';

import { createApi } from '@reduxjs/toolkit/query/react';

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

export interface SupFileResponse {
  mimeType: string;
  publicUrl: string;
  displayName: string;
}

export interface WixUploadRequest {
  file: string;
  bucketName: string;
  destinationPath: string;
  displayName: string;
  contentType: string;
  contentId?: string;
}
// // Old one
// export interface WixDraftPostResponse {
//   data?: {
//     title: string;
//     excerpt: string;
//     featured: boolean;
//     catetegoryId: string[];
//     memberId: string;
//     status: string;
//     richContent: RichContent;
//     url: string;
//   }[];
//   error?: any;
// }

export interface WixDraftPostResponse {
  draftPost?: {
    id: string;
    title: string;
    featured: boolean;
    categoryIds: string[];
    memberId: string;
    status: string;
    url: {
      base: string;
      path: string;
    };
    seoSlug: string;
    seoData?: {
      tags?: Tags[];
    };
    minutesToRead: number;
    firstPublishedDate: string;
    editedDate: string;
    hasUnpublishedChanges: boolean;
  };
  error?: any;
}

export interface WixCreatePublishPostRequest {
  title: string;
  richContent: string; // Will revert back to RichContent if we choose to refactor our Backend API
  content_id: string;
  draftPostId?: string;
  seo_slug?: string;
  seo_title_tag?: Tags | null;
  seo_meta_description?: Tags | null;
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
    uploadToSupabase: builder.mutation<{ file: SupFileResponse }, {channelId: string ; fileData: WixUploadRequest}>({
      query: ({channelId, fileData}) => ({
        url: `functions/v1/api/upload-file/${channelId}/upload-image-no-wix`,
        method: 'POST',
        body: {
          file: fileData.file,
          bucketName: fileData.bucketName,
          destinationPath: fileData.destinationPath,
          displayName: fileData.displayName,
          contentType: fileData.contentType,
          contentId: fileData.contentId,
        },
      }),
    }),
    CreatePublishToWix: builder.mutation<
      WixDraftPostResponse,
      { channel_id: string; CreatePublishReq: WixCreatePublishPostRequest }
    >({
      query: ({ channel_id, CreatePublishReq }) => ({
        url: `functions/v1/api/integrations/wix/post/${channel_id}/create-publish`,
        method: 'POST',
        body: CreatePublishReq,
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const { 
  useUploadToWixMutation,
  useUploadToSupabaseMutation,
  useCreatePublishToWixMutation } = WixApi;
