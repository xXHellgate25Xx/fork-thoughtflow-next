import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../supabase/baseQuery";

interface GenContentReq {
    idea: string | undefined,
    feedback: string | undefined;
    content: string | undefined;
    action: "initial" | "feedback";
}

interface GenContentRes {
    data?: any;
    error?: any
}

const generateContentApi = createApi({
    reducerPath: "generate",
    baseQuery,
    endpoints: (builder) => ({
        // -----------------------STORAGE DIRECT BLOB UPLOAD-------------------------
        generateContent: builder.mutation<GenContentRes, GenContentReq>({
            query: ({ idea, feedback, content, action }) => ({
                url: `functions/v1/api/generate-content`,
                method: "POST",
                body: { idea, feedback, content, action }
            })
        }),
    })
})

export const {
    useGenerateContentMutation,
} = generateContentApi;
export { generateContentApi };