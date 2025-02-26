import { RichContent } from 'ricos-schema';
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../supabase/baseQuery";

export interface ContentApiRes{
    content_id: string;
    channel_type: string;
    title: string;
    pillar_id: string;
    pillar: string;
    status: string;
    pageviews: number;
    last_modified: string;
    channel_id: string | null;
    content_body: string;
    rich_content: RichContent;
}

export interface AnalyticsApiRes{
  user_id: string,
  published: number,
  archived: number,
  draft: number,
  total: number
}

interface getAllContentsOfUserRes {
    data: ContentApiRes[];
    error?: string;
}

interface getAllStatsOfUserRes {
  data: AnalyticsApiRes[];
  error?: string;
}

interface ContentUpdatePayload {
  content_body?: string;
  rich_content?: string;
  title?: string;
  excerpt?: string;
  status?: 'draft' | 'published';
  content_type?: string;
  published_url?: string;
  media_id?: string[];
  pillar_id?: string;
  seo_slug?: string ;
  seo_title_tag?: string;
  seo_meta_description?: string;
  long_tail_keyword?: string;
}

export interface ContentRes {
  uuid: string;
  account_id: string;
  created_at: string;
  updated_at: string;
  content_id: string;
  idea_id: string;
  content_body: string;
  rich_content: RichContent;
  title: string;
  excerpt: string;
  status: 'draft' | 'published';
  content_type: string;
  published_url: string | null;
  published_at: string | null;
  revision: number;
  media_id: string[];
  pillar_id: string | null;
  channel_id: string | null;
  channel_type: string | null;
  seo_slug?: string ;
  seo_title_tag?: string;
  seo_meta_description?: string;
  long_tail_keyword?: string;
}

export interface getContentResponse {
  data: ContentRes[],
  error?: string
}

export interface ContentViewRes {
  content_id: string;
  title: string;
  pillar: string;
  view_counts: string;
}

export interface getContentViewCountResponse {
    data: ContentViewRes[],
    error?: string
}

const ContentPageApi = createApi({
    reducerPath: "contentPageApi",
    baseQuery,
    endpoints: (builder) => ({
      // ------------------GET ALL CONTENTS OF USER--------------------------
      getAllContentsOfUser: builder.query<getAllContentsOfUserRes, void>({
          query: () => ({        
              url: `/functions/v1/api/content/`,
              method: 'GET'
          }),
      }),
      // ------------------GET ALL STATS OF USER--------------------------
      getAllStatsOfUser: builder.query<getAllStatsOfUserRes, void>({
        query: () => ({        
            url: `/functions/v1/api/analytics/account`,
            method: 'GET'
        }),
      }),
      // ------------------GET CONTENT BY ID--------------------------
      getContent: builder.query<getContentResponse, {contentId: string}>({
        query: ({contentId}) => ({        
            url: `/functions/v1/api/content/${contentId}`,
            method: 'GET'
        }),
      }),
      // -----------------GET CONTENT VIEW COUNT BY ID--------------------
      getContentViewCount: builder.query<getContentViewCountResponse, {contentId: string, type_of_agg: string}>({
        query: ({contentId, type_of_agg}) => ({
          url: `/functions/v1/api/content/${contentId}/${type_of_agg}`,
          method: 'GET'
        }),
      }),
      // ------------------GET CONTENT REVISIONS--------------------------
      getContentRevisions: builder.query<getAllContentsOfUserRes, string>({
        query: (contentId) => ({        
            url: `/functions/v1/api/content/${contentId}/revisions`,
            method: 'GET'
        }),
      }),
      // ------------------UPDATE CONTENT--------------------------
      updateContent: builder.mutation<getContentResponse, {contentId: string; content: ContentUpdatePayload}>({
        query: ({contentId, content}) => ({        
            url: `/functions/v1/api/content/${contentId}`,
            method: 'PUT',
            body: content
        }),
      }),
      // ------------------DELETE CONTENT--------------------------
      deleteContent: builder.mutation<getAllContentsOfUserRes, string>({
        query: (contentId) => ({        
            url: `/functions/v1/api/content/${contentId}`,
            method: 'DELETE'
        }),
      }),
    })
});
  
  export const {
    useGetAllContentsOfUserQuery,
    useGetAllStatsOfUserQuery,
    useGetContentQuery,
    useGetContentViewCountQuery,
    useGetContentRevisionsQuery,
    useUpdateContentMutation,
    useDeleteContentMutation,
  } = ContentPageApi;
  export { ContentPageApi };
  