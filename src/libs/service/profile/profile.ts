import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../supabase/baseQuery";

const ProfileApi = createApi({
    reducerPath: "profileApi",
    baseQuery,
    endpoints: (builder) => ({

        // ------------------GET PROFILE--------------------------
        getProfile: builder.query<any, void>({
            query: () => ({
                url: `/functions/v1/api/profile`,
                method: 'GET'
            }),
          }),
          // ------------------PUT PROFILE NAME--------------------------
        updateDisplayName: builder.mutation<any, {custom_display_name: string}>({
            query: ({custom_display_name}) => ({
                url: `/functions/v1/api/profile/display_name`,
                method: 'PUT',
                body: {
                    custom_display_name
                  },
            }),
          }),
        //   ------------------GET PROFILE--------------------------
          updatePassword: builder.mutation<any, {current_password: string, new_password: string, refresh_token: string}>({
              query: ({current_password,
                new_password, refresh_token}) => ({
                  url: `/functions/v1/api/profile/password`,
                  method: 'PUT',
                  body: {
                    current_password,
                    new_password,
                    refresh_token
                },
              }),
            }),
    })
});

export const {
    useGetProfileQuery,
    useUpdateDisplayNameMutation,
    useUpdatePasswordMutation
  } = ProfileApi;
  export { ProfileApi };
