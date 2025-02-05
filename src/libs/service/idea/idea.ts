import { RichContent } from 'ricos-schema';
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

interface createContentProps {
    content_body: string | undefined;
    rich_content: RichContent;
    title: string | undefined;
    excerpt: string;
    status: string;
    content_type: string;
    channel_id: string;
}

interface IdeaRes {
    data?: {
        uuid?: string;
        id?: string;
        created_at?: string;
        updated_at?: string;
        text?: string;
        voice_input?: string;
        user_id?: string;
        is_deleted?: boolean;
        pillar_id?: string;
        title?: string;
        status?: string;
        statusText?: string;
        content_id?: string;
        idea_id?: string;
        channel_id?: string;
        content_body?: string;
        excerpt?: string;
        content_type?: string;
        published_url?:string;
        revision?: number
        media_id?: string[];
        published_at?: any;
        rich_content?: RichContent;
    }[];
    error?: any
}

const IdeaApi = createApi({
    reducerPath: "idea",
    baseQuery,
    endpoints: (builder) => ({
        // -----------------------LIST IDEAs--------------------------
        listIdeas: builder.query<IdeaRes, void>({
            query: () => ({
                url: "functions/v1/api/idea"
            })
        }),

        // -----------------------CREATE IDEA-------------------------
        createIdea: builder.mutation<IdeaRes, IdeaReq>({
            query: ({ text, voice_input, pillar_id, }) => ({
                url: "functions/v1/api/idea",
                method: "POST",
                body: {
                    text,
                    voice_input,
                    pillar_id,
                }
            })
        }),
        // -----------------------CREATE IDEA-------------------------
        createIdeaContent: builder.mutation<IdeaRes, { ideaId: string | undefined, payload: createContentProps }>({
            query: ({ ideaId, payload }) => ({
                url: `functions/v1/api/idea/${ideaId}/create`,
                method: "POST",
                body: payload
            })
        }),
    })
})

export const {
    useListIdeasQuery,
    useCreateIdeaMutation,
    useCreateIdeaContentMutation,
} = IdeaApi;
export { IdeaApi };
