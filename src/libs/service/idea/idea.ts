import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../supabase/baseQuery";

interface IdeaReq {
    id?: string;
    created_at?: string | null | undefined;
    updated_at?: string | null | undefined;
    idea_id?: string | null | undefined;
    text?: string | null | undefined;
    pillar_id?: string | null | undefined;
    voice_input?: string | null | undefined;
    user_id?: string | null | undefined;
    is_deleted?: boolean;
    content_body?: string | null | undefined;
    title?: string | null | undefined;
    excerpt?: string | null | undefined;
    status?: 'draft' | 'published';
    content_type?: string | null | undefined;
    published_url?: string | null | undefined;
    media_id?: (string | null | undefined)[];
}

interface IdeaRes {
    data?: any;
    error?: any
}

const IdeaApi = createApi({
    reducerPath: "idea",
    baseQuery,
    endpoints: (builder) => ({
        // -----------------------LIST IDEAs--------------------------
        listIdeas: builder.query<IdeaRes, void>({
            query: () => ({
                url:"functions/v1/api/idea"
            })
        }),

        // -----------------------CREATE IDEA-------------------------
        createIdea: builder.mutation<IdeaRes, IdeaReq>({
            query: ({text, voice_input, pillar_id,}) => ({
                url: "functions/v1/api/idea",
                method: "POST",
                body: {
                    text, 
                    voice_input, 
                    pillar_id,
                }
            })
        }),
    })
})

export const {
    useListIdeasQuery,
    useCreateIdeaMutation,
} = IdeaApi;
export { IdeaApi };
