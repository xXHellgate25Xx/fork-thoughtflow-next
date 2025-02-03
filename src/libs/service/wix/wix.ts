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

export const WixApi = createApi({
  reducerPath: 'supabaseApi',
  baseQuery,
  endpoints: (builder) => ({
    uploadToWix: builder.mutation<{ file: FileResponse }, WixUploadRequest>({
      query: (fileData) => ({
        url: `functions/v1/api2/upload-file/72c3825a-4675-480a-a952-033cc75111c3/upload-image`,
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
  }),
});

// Export hooks for usage in functional components
export const { useUploadToWixMutation } = WixApi;
