import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQuery } from "../supabase/baseQuery";


interface UpdateProfileImageRequest {
  file: string;
  bucketName: string;
  destinationPath: string;
  displayName: string;
  contentType: string;
}


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
          //   ------------------Update Display Image--------------------------
          updateDisplayImage: builder.mutation<any, UpdateProfileImageRequest>({
            query: ({file,
              bucketName,
              destinationPath,
              displayName,
              contentType}) => ({
                url: `/functions/v1/api/profile/change-photo`,
                method: 'PUT',
                body: {
                  file,
                  bucketName,
                  destinationPath,
                  displayName,
                  contentType
              },
            }),
          }),
    })
});

export const {
    useGetProfileQuery,
    useUpdateDisplayNameMutation,
    useUpdatePasswordMutation,
    useUpdateDisplayImageMutation
  } = ProfileApi;
  export { ProfileApi };
