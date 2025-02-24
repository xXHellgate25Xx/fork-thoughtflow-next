import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../supabase/baseQuery";

interface pillarIdReq {
    pillarId: string | undefined;
}

interface getPillarByIdRes {
    error: string | null;
    data: Array<{
        id: string;
        created_at: string;
        updated_at: string;
        name: string;
        user_id: string;
        is_active: boolean;
        account_id: string | null;
        description: string | null;
        primary_keyword: string | null;
        n_published: number;
        n_draft: number;
        content_views: number;
    }>;
    count: number | null;
    status: number;
    statusText: string;
}

interface getIdeasOfPillarRes {
    error: string | null;
    data: Array<{
        id: string;
        created_at: string;
        updated_at: string;
        text: string;
        voice_input: string | null;
        user_id: string;
        is_deleted: boolean;
        pillar_id: string;
        title: string;
    }>;
    count: number | null;
    status: number;
    statusText: string;
}

interface updatePillarReq {
    pillarId: string | undefined;
    newName: string;
    newDesc: string;
    newKeyword: string;
}

export interface Content{
    content_id: string;
    title: string;
    channel_type: string;
    pillar_id: string;
    pillar: string;
    status: string;
    pageviews: number;
    last_modified: string;
}

export interface contentApiRes{
    data: Content[];
}

const PillarPageApi = createApi({
    reducerPath: "pillarPageApi",
    baseQuery,
    endpoints: (builder) => ({
      // ------------------GET PILLAR BY ID--------------------------
      getPillarById: builder.query<getPillarByIdRes, pillarIdReq>({
          query: ({pillarId}) => ({        
              url: `/functions/v1/api/content-pillars/${pillarId}`,
              method: 'GET'
          }),
      }),
      // ------------------GET ALL ACTIVE IDEAS BY PILLAR ID--------------------------
      getIdeasOfPillar: builder.query<getIdeasOfPillarRes, pillarIdReq>({
        query: ({pillarId}) => ({        
            url: `/functions/v1/crud-idea`,
            method: 'POST',
            body: {
                action: "list-active-from-pillar",
                params: {
                  pillar_id: pillarId
                }
            }
        })
      }),
      // ------------------UPDATE PILLAR NAME--------------------------
      updatePillarName: builder.mutation<any, updatePillarReq>({
        query: ({pillarId, newName, newDesc, newKeyword}) => ({
            url: `functions/v1/api/content-pillars/${pillarId}`,
            method: 'PUT',
            body: {
                name : newName,
                description: newDesc,
                primary_keyword: newKeyword
            }
        })
      }),
      // ------------------DEACTIVATE PILLAR--------------------------
      deactivatePillar: builder.mutation<any, pillarIdReq>({
        query: ({pillarId}) => ({
            url: `functions/v1/api/content-pillars/${pillarId}`,
            method: 'DELETE'
        })
      }),
      // ------------------GET ALL CONTENTS OF PILLAR--------------------------
      getAllContentsFromPillarId: builder.query<contentApiRes, pillarIdReq>({
        query: ({pillarId}) => ({
            url: `functions/v1/api/content-pillars/${pillarId}/contents`,
            method: 'GET'
        })
      }),
    }),
});
  
  export const {
    useGetPillarByIdQuery,
    useGetIdeasOfPillarQuery,
    useUpdatePillarNameMutation,
    useDeactivatePillarMutation,
    useGetAllContentsFromPillarIdQuery
  } = PillarPageApi;
  export { PillarPageApi };
  