import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./supabase/baseQuery";

interface getPillarByIdReq {
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
    }>;
    count: number | null;
    status: number;
    statusText: string;
}

interface getIdeasOfPillarReq {
    pillarId: string | undefined;
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


const PillarPageApi = createApi({
    reducerPath: "pillarPageApi",
    baseQuery,
    endpoints: (builder) => ({
      // ------------------GET PILLAR BY ID--------------------------
      getPillarById: builder.query<getPillarByIdRes, getPillarByIdReq>({
          query: ({pillarId}) => ({        
              url: `/functions/v1/api/content-pillars/${pillarId}`,
              method: 'GET'
          }),
      }),
      // ------------------GET ALL ACTIVE IDEAS BY PILLAR ID--------------------------
      getIdeasOfPillar: builder.query<getIdeasOfPillarRes, getIdeasOfPillarReq>({
        query: ({pillarId}) => ({        
            url: `/functions/v1/crud-idea`,
            method: 'POST',
            body: {
                action: "list-active-from-pillar",
                params: {
                  pillar_id: pillarId
                }
            }
        }),
    }),
  })
});
  
  export const {
    useGetPillarByIdQuery,
    useGetIdeasOfPillarQuery
  } = PillarPageApi;
  export { PillarPageApi };
  