import { RichContent } from 'ricos-schema';
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../supabase/baseQuery";

interface repurposeContentProps {
    content_body: string;
    channel_id: string;
}

interface RepurposeRes {
    content_id: string;
    user_id: string;
    idea_id: string;
    channel_id: string;
    content_body: string;
    title: string;
    excerpt: string;
    status: string;
    content_type: string;
    pillar_id: string;
    seo_title_tag: string;
    seo_meta_description: string;
    seo_slug: string;
    long_tail_keyword: string;
    content_html: string;
}

const RepurposeApi = createApi({
    reducerPath: "repurpose",
    baseQuery,
    endpoints: (builder) => ({
        // -----------------------REPURPOSE CONTENT-------------------------
        repurposeContent: builder.mutation<RepurposeRes, { ideaId: string | undefined, payload: repurposeContentProps }>({
            query: ({ ideaId, payload }) => ({
                url: `functions/v1/api/idea/${ideaId}/repurpose`,
                method: "POST",
                body: payload
            })
        }),
    })
})

export const {
    useRepurposeContentMutation
} = RepurposeApi;
export { RepurposeApi };
