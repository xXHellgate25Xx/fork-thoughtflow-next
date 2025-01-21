import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../supabase/baseQuery";

interface StorageReq {
    file?: any,
    bucketName?: string,
    folderName?: string,
    fileName?: string
}

interface StorageRes {
    data?: any;
    error?: any;
    Id?: any
}

const processingFilePath = async (file: any, folderName: string | undefined, fileName: string | undefined) => {
    const data = new TextEncoder().encode(`${file.name}-${Date.now()}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const uniqueHash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    return `${folderName}/${uniqueHash}/${fileName ?? file.name}.${file.type.split("/")[1]}`;
};

const uploadToStorageApi = createApi({
    reducerPath: "storage",
    baseQuery,
    endpoints: (builder) => ({
        // -----------------------STORAGE DIRECT BLOB UPLOAD-------------------------
        uploadToStorage: builder.mutation<StorageRes, StorageReq>({
            query: ({ file, bucketName, folderName, fileName }) => ({
                url: `/${bucketName}/${() => processingFilePath(file, folderName, fileName).then((path)=>path)}`,
                method: "POST",
                headers: {
                    "Content-Type": file.type,
                },
                body: file
            })
        }),
    })
})


export const {
    useUploadToStorageMutation,
} = uploadToStorageApi;
export { uploadToStorageApi };