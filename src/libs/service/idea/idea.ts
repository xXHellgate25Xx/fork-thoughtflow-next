import type { RichContent } from '@wix/ricos';

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
    seo_slug?: string | null | undefined;
    seo_title_tag?: string | null | undefined;
    seo_meta_description?: string | null | undefined;
    content_type: string;
    channel_id: string;
    long_tail_keyword: string | null | undefined;
    content_html: string | undefined;
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
        channel_type?: string;
        content_body?: string;
        excerpt?: string;
        content_type?: string;
        published_url?:string;
        revision?: number
        media_id?: string[];
        published_at?: any;
        seo_slug?: string ;
        seo_title_tag?: string;
        seo_meta_description?: string ;
        rich_content?: RichContent;
        long_tail_keyword?: string;
    }[];
    error?: any
}

interface IdeaItemRes {
    data: {
        id?: string;
        created_at?: any;
        updated_at?: any;
        text?: string;
        voice_input?: string;
        pillar_id?: string;
        account_id?: string;
        user_id?: string;
        title?: string;
    }[]
}

interface ideaToContentReq {
    text: string;
    voice_input: string | null;
    pillar_id: string;
    model: string;
}

interface ideaToContentRes {
    idea_id: string;
}

// New response type for paginated ideas
export interface ListIdeasResponse {
  data: IdeaRes['data'];
  pagination: {
    page: number;
    page_size: number;
    total: number;
  };
}

// Query params for listIdeas
export interface ListIdeasRequest {
  page?: number;
  page_size?: number;
  sort_field?: 'created_at' | 'title' | 'pillar_id' | 'status';
  sort_direction?: 'asc' | 'desc';
  [key: string]: any; // for arbitrary filters
}

const IdeaApi = createApi({
    reducerPath: "idea",
    baseQuery,
    endpoints: (builder) => ({
        // -----------------------LIST IDEAs--------------------------
        listIdeas: builder.query<ListIdeasResponse, ListIdeasRequest | void>({
            query: (params) => {
                const safeParams = params || {};
                const queryParams = new URLSearchParams();
                Object.entries(safeParams).forEach(([key, value]) => {
                  if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, String(value));
                  }
                });
                return {
                  url: `functions/v1/api/idea${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
                  method: 'GET',
                };
            }
        }),

        // -----------------------CREATE IDEA-------------------------
        createIdea: builder.mutation<IdeaRes, IdeaReq>({
            query: ({ text, voice_input, pillar_id}) => ({
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
        // -----------------------GET IDEA BY ID-------------------------
        getIdeaById: builder.query<IdeaItemRes, { ideaId: string | undefined }>({
            query: ({ ideaId }) => ({
                url: `functions/v1/api/idea/${ideaId}`,
                method: "GET"
            })
        }),
        // -----------------------GET IDEA BY ID-------------------------
        getContentByIdea: builder.query<IdeaRes, { ideaId: string | undefined }>({
            query: ({ ideaId }) => ({
                url: `functions/v1/api/idea/${ideaId}/contents`,
                method: "GET"
            })
        }),
        // -----------------------IDEA TO CONTENT-------------------------
        ideaToContent: builder.mutation<ideaToContentRes, ideaToContentReq>({
            query: (payload) => ({
                url: "functions/v1/api/idea-to-content",
                method: "POST",
                body: payload
            })
        })
    })
})

export const {
    useListIdeasQuery,
    useCreateIdeaMutation,
    useCreateIdeaContentMutation,
    useGetIdeaByIdQuery,
    useGetContentByIdeaQuery,
    useIdeaToContentMutation
} = IdeaApi;
export { IdeaApi };
