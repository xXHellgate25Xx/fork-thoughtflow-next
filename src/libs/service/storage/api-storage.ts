import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQuery } from "../supabase/baseQuery";

interface StorageReq {
  file?: any;
  bucketName?: string;
  pathName?: string;
}

interface StorageRes {
  data?: any;
  error?: any;
  Id?: any;
}

const uploadToStorageApi = createApi({
    reducerPath: "storage",
    baseQuery,
    endpoints: (builder) => ({
        // -----------------------STORAGE DIRECT BLOB UPLOAD-------------------------
        uploadToStorage: builder.mutation<StorageRes, StorageReq>({
            query: ({ file, bucketName, pathName }) => ({
                url: `/storage/v1/object/${bucketName}/${pathName}`,
                method: "POST",
                headers: {
                    "Content-Type": file.type,
                },
                body: file
            })
        })
    ,
    getMediaFromStorage: builder.query<StorageRes, StorageReq>({
      query: ({ bucketName, pathName }) => ({
        url: `/storage/v1/object/${bucketName}/${pathName}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useUploadToStorageMutation , useLazyGetMediaFromStorageQuery } = uploadToStorageApi;
export { uploadToStorageApi };
