import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQuery } from "../supabase/baseQuery";

interface LinkedinAccessTokenRes {
    access_token: string;
    expires_in: number;
    scope: string;
}

const linkedinApi = createApi({
    reducerPath: "linkedinApi",
    baseQuery,
    endpoints: (builder) => ({
        // -----------------------STORAGE DIRECT BLOB UPLOAD-------------------------
        getLinkedinAccessToken: builder.mutation<LinkedinAccessTokenRes, { code: string}>({
            query: ({ code }) => ({
                url: `functions/v1/api/integrations/linkedin/integration`,
                method: "POST",
                body: {
                  code
                }
            })
        }),
    })
})

export const {
    useGetLinkedinAccessTokenMutation,
} = linkedinApi;
export { linkedinApi };

